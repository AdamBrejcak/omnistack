import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow(),
    stripeCustomerId: text("stripe_customer_id").unique(),
});

export type User = typeof users.$inferSelect;

export const subscriptionStatusEnum = pgEnum("subscription_status", [
    "incomplete",
    "incomplete_expired",
    "trialing",
    "active",
    "past_due",
    "canceled",
    "unpaid",
    "paused",
]);

export const subscriptions = pgTable("subscriptions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),

    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),

    currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
    currentPeriodEnd: timestamp("current_period_end", { mode: "date" }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;

export const orders = pgTable("orders", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(), // Optional, helpful for Checkout sessions
    amount: integer("amount").notNull(), // Amount in cents (e.g. 1000 = $10.00)
    currency: text("currency").notNull().default("usd"),
    status: text("status").notNull(), // 'succeeded', 'pending', etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;