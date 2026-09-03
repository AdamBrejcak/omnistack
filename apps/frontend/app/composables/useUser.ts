import type { User, Subscription } from "@omnistack/core/db";

export const useUser = () => {
    const user = useState<User | null>("auth-user", () => null);
    const subscription = useState<Subscription | null>("auth-subscription", () => null);

    const setUser = (data: Partial<User> | null) => {
        if (!data) {
            user.value = null;
            return;
        }
        user.value = user.value ? { ...user.value, ...data } : (data as User);
    };

    const setSubscription = (data: Partial<Subscription> | null) => {
        if (!data) {
            subscription.value = null;
            return;
        }
        subscription.value = subscription.value
            ? { ...subscription.value, ...data }
            : (data as Subscription);
    };

    const clearUser = () => {
        user.value = null;
        subscription.value = null;
    };

    const isPro = computed(() => {
        if (!subscription.value) return false;

        const { status, currentPeriodEnd } = subscription.value;
        const isStatusActive = status === "active" || status === "trialing";

        const isPeriodValid = currentPeriodEnd
            ? new Date(currentPeriodEnd) > new Date()
            : false;

        return isStatusActive || isPeriodValid;
    });

    return {
        user,
        subscription,
        setUser,
        setSubscription,
        clearUser,
        isPro,
    };
};