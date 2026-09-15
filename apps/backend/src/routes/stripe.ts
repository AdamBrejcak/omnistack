import { Hono } from "hono";
import { validator } from "hono/validator";
import { stripe } from "../lib/stripe";
import { db, users, subscriptions, orders } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { requireAuth, type Env } from "../middleware/auth";
import { ok, fail } from "../lib/response";

const toSafeDate = (timestamp?: number | null): Date => {
    if (!timestamp || isNaN(Number(timestamp))) {
        return new Date();
    }
    return new Date(timestamp * 1000);
};

const getSubscriptionDates = (sub: Stripe.Subscription) => {
    const subAny = sub as any;
    const firstItem = sub.items?.data?.[0] as any;

    const rawStart = subAny.current_period_start ?? firstItem?.current_period_start;
    const rawEnd = subAny.current_period_end ?? firstItem?.current_period_end;

    return {
        currentPeriodStart: toSafeDate(rawStart),
        currentPeriodEnd: toSafeDate(rawEnd),
    };
};

const app = new Hono<Env>()
    // --------------------------------------------------------------------------
    // 1. CHECKOUT SESSION ENDPOINT
    // --------------------------------------------------------------------------
    .post(
        "/checkout",
        requireAuth,
        validator("json", (value, c) => {
            const { priceId, mode, successUrl, cancelUrl } = value as {
                priceId?: string;
                mode?: "subscription" | "payment";
                successUrl?: string;
                cancelUrl?: string;
            };

            if (!priceId || !mode || !successUrl || !cancelUrl) {
                return fail(c, "invalid_request", "Missing required parameters (priceId, mode, successUrl, cancelUrl)", 400);
            }

            return { priceId, mode, successUrl, cancelUrl };
        }),
        async (c) => {
            const authUserId = c.get("userId");
            const authEmail = c.get("email");
            const { priceId, mode, successUrl, cancelUrl } = c.req.valid("json");

            try {
                const dbUser = await db.query.users.findFirst({
                    where: eq(users.id, authUserId),
                });

                const urlDelimiter = successUrl.includes("?") ? "&" : "?";

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price: priceId,
                            quantity: 1,
                        },
                    ],
                    mode: mode,
                    ...(dbUser?.stripeCustomerId
                        ? { customer: dbUser.stripeCustomerId }
                        : { customer_email: dbUser?.email || authEmail }
                    ),
                    success_url: `${successUrl}${urlDelimiter}session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: cancelUrl,
                    metadata: {
                        userId: authUserId,
                    },
                });

                return ok(c, { url: session.url });
            } catch (error: any) {
                console.error("Failed to create Stripe checkout session:", error);
                return fail(c, "checkout_failed", error.message, 500);
            }
        }
    )
    // --------------------------------------------------------------------------
    // 2. CUSTOMER PORTAL ENDPOINT
    // --------------------------------------------------------------------------
    .post(
        "/portal",
        requireAuth,
        validator("json", (value, c) => {
            const { returnUrl } = value as { returnUrl?: string };

            if (!returnUrl) {
                return fail(c, "invalid_request", "Missing required parameter (returnUrl)", 400);
            }

            return { returnUrl };
        }),
        async (c) => {
            const authUserId = c.get("userId");
            const { returnUrl } = c.req.valid("json");

            try {
                const dbUser = await db.query.users.findFirst({
                    where: eq(users.id, authUserId),
                });

                if (!dbUser?.stripeCustomerId) {
                    return fail(c, "no_stripe_customer", "User does not have an active Stripe customer account.", 400);
                }

                const session = await stripe.billingPortal.sessions.create({
                    customer: dbUser.stripeCustomerId,
                    return_url: returnUrl,
                });

                return ok(c, { url: session.url });
            } catch (error: any) {
                console.error("Failed to create Stripe billing portal session:", error);
                return fail(c, "portal_failed", error.message, 500);
            }
        }
    )
    // --------------------------------------------------------------------------
    // 3. STRIPE WEBHOOK HANDLER
    // --------------------------------------------------------------------------
    // Synchronous, in-Lambda handling (no SQS/queue decoupling): verify the
    // signature, process the event inline, and respond. Keep this fast and
    // idempotent since Stripe enforces a response timeout and retries on
    // failure or timeout.
    .post("/webhook", async (c) => {
        const signature = c.req.header("stripe-signature");

        if (!signature) {
            return fail(c, "missing_signature", "Missing stripe-signature", 400);
        }

        let event: Stripe.Event;

        try {
            const rawBody = await c.req.text();
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error("Stripe webhook signature verification failed:", err);
            return fail(c, "invalid_signature", `Webhook signature verification failed: ${err.message}`, 400);
        }

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const userId = session.metadata?.userId;

                    if (!userId) break;

                    // Always save stripeCustomerId to the user if created during Checkout
                    if (session.customer) {
                        await db
                            .update(users)
                            .set({ stripeCustomerId: session.customer as string })
                            .where(eq(users.id, userId));
                    }

                    // Handle Subscription Mode
                    if (session.mode === "subscription" && session.subscription) {
                        const sub = await stripe.subscriptions.retrieve(
                            session.subscription as string
                        );

                        const priceId = sub.items?.data?.[0]?.price?.id || "";
                        const { currentPeriodStart, currentPeriodEnd } = getSubscriptionDates(sub);

                        await db.insert(subscriptions).values({
                            id: sub.id,
                            userId: userId,
                            stripeCustomerId: session.customer as string,
                            stripeSubscriptionId: sub.id,
                            stripePriceId: priceId,
                            status: sub.status as any,
                            cancelAtPeriodEnd: sub.cancel_at_period_end,
                            currentPeriodStart,
                            currentPeriodEnd,
                        }).onConflictDoUpdate({
                            target: subscriptions.stripeSubscriptionId,
                            set: {
                                stripePriceId: priceId,
                                status: sub.status as any,
                                cancelAtPeriodEnd: sub.cancel_at_period_end,
                                currentPeriodStart,
                                currentPeriodEnd,
                                updatedAt: new Date(),
                            },
                        });
                    }

                    // Handle One-Time Payment Mode
                    if (session.mode === "payment" && session.payment_intent) {
                        await db.insert(orders).values({
                            id: session.id,
                            userId: userId,
                            stripePaymentIntentId: session.payment_intent as string,
                            stripeCheckoutSessionId: session.id,
                            amount: session.amount_total || 0,
                            currency: session.currency || "usd",
                            status: session.payment_status,
                        }).onConflictDoUpdate({
                            target: orders.stripePaymentIntentId,
                            set: {
                                status: session.payment_status,
                            },
                        });
                    }
                    break;
                }

                case "customer.subscription.updated":
                case "customer.subscription.deleted": {
                    const sub = event.data.object as Stripe.Subscription;
                    const priceId = sub.items?.data?.[0]?.price?.id || "";
                    const { currentPeriodStart, currentPeriodEnd } = getSubscriptionDates(sub);

                    const isCancelPending = Boolean(
                        sub.cancel_at_period_end || sub.cancel_at || sub.canceled_at
                    );
                    await db.update(subscriptions)
                        .set({
                            stripePriceId: priceId,
                            status: sub.status as any,
                            cancelAtPeriodEnd: isCancelPending,
                            currentPeriodStart,
                            currentPeriodEnd,
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
                    break;
                }
            }
        } catch (error) {
            console.error(`Failed to process Stripe webhook event ${event.type} (${event.id}):`, error);
            return fail(c, "webhook_processing_failed", "Failed to process webhook event", 500);
        }

        return ok(c, { received: true });
    });

export default app;
