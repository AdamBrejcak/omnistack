import type { User, Subscription } from "@omnistack/core/db";
import type { Serialized } from "@omnistack/core/api";

export type ClientUser = Serialized<User>;
export type ClientSubscription = Serialized<Subscription>;

export const useUser = () => {
    const user = useState<ClientUser | null>("auth-user", () => null);
    const subscription = useState<ClientSubscription | null>("auth-subscription", () => null);

    const setUser = (data: Partial<ClientUser> | null) => {
        if (!data) {
            user.value = null;
            return;
        }
        user.value = user.value ? { ...user.value, ...data } : (data as ClientUser);
    };

    const setSubscription = (data: Partial<ClientSubscription> | null) => {
        if (!data) {
            subscription.value = null;
            return;
        }
        subscription.value = subscription.value
            ? { ...subscription.value, ...data }
            : (data as ClientSubscription);
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