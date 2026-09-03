export const useStripe = () => {
    const { fetchWithAuth } = useApi();
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

            const response = await fetchWithAuth<{ url: string }>("api/stripe/checkout", {
                method: "POST",
                body: {
                    priceId: options.priceId,
                    mode: options.mode,
                    userId: options.userId,
                    userEmail: options.userEmail,
                    stripeCustomerId: options.stripeCustomerId,
                    successUrl: options.successUrl || `${origin}/?payment=success`,
                    cancelUrl: options.cancelUrl || `${origin}/?payment=cancelled`,
                },
            });

            if (response?.url) {
                await navigateTo(response.url, { external: true });
            }
        } catch (err: any) {
            error.value =
                err.data?.error || err.message || "Failed to create checkout session.";
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

            const response = await fetchWithAuth<{ url: string }>("api/stripe/portal", {
                method: "POST",
                body: {
                    stripeCustomerId,
                    returnUrl: returnUrl || `${origin}/`,
                },
            });

            if (response?.url) {
                await navigateTo(response.url, { external: true });
            }
        } catch (err: any) {
            error.value =
                err.data?.error || err.message || "Failed to open customer portal.";
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