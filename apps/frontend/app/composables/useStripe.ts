export const useStripe = () => {
    const { client } = useApi();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const redirectToCheckout = async (options: {
        priceId: string;
        mode: "subscription" | "payment";
        userId: string;
        userEmail: string;
        stripeCustomerId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => {
        loading.value = true;
        error.value = null;

        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";

            const res = await client.api.stripe.checkout.$post({
                json: {
                    priceId: options.priceId,
                    mode: options.mode,
                    successUrl: options.successUrl || `${origin}/dashboard?success=true`,
                    cancelUrl: options.cancelUrl || `${origin}/dashboard?payment=cancelled`,
                },
            });
            const data = await unwrap(res);

            if (data?.url) {
                await navigateTo(data.url, { external: true });
            }
        } catch (err: any) {
            error.value = err.message || "Failed to create checkout session.";
            console.error("Stripe Checkout Error:", err);
        } finally {
            loading.value = false;
        }
    };

    const redirectToPortal = async (
        stripeCustomerId?: string | null,
        returnUrl?: string
    ) => {
        if (!stripeCustomerId) {
            error.value = "Stripe Customer ID is missing.";
            console.error("Stripe Portal Error: Missing customer ID");
            return;
        }

        loading.value = true;
        error.value = null;

        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";

            const res = await client.api.stripe.portal.$post({
                json: {
                    returnUrl: returnUrl || `${origin}/dashboard`,
                },
            });
            const data = await unwrap(res);

            if (data?.url) {
                await navigateTo(data.url, { external: true });
            }
        } catch (err: any) {
            error.value = err.message || "Failed to open customer portal.";
            console.error("Stripe Portal Error:", err);
        } finally {
            loading.value = false;
        }
    };

    return {
        redirectToCheckout,
        redirectToPortal,
        loading: readonly(loading),
        error: readonly(error),
    };
};