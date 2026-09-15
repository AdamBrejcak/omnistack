import type { User, Subscription } from "@omnistack/core/db";
import type { Serialized } from "@omnistack/core/api";
import { useApi, unwrap } from "./useApi";

export type ClientUser = Serialized<User>;
export type ClientSubscription = Serialized<Subscription>;

export const useUser = () => {
    const { client } = useApi();
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

    // Upserts the Firebase-authenticated user into Neon DB (POST /api/user/sync).
    const syncUser = async (name?: string | null) => {
        const res = await client.api.user.sync.$post({
            json: { name: name || undefined },
        });
        const data = await unwrap(res);
        setUser(data.user);
        setSubscription(data.subscription);
        return data;
    };

    // Fetches the current user's profile + subscription (GET /api/user/profile).
    const fetchProfile = async () => {
        const res = await client.api.user.profile.$get();
        const data = await unwrap(res);
        setUser(data.user);
        setSubscription(data.subscription);
        return data;
    };

    // Updates name/avatarUrl (PATCH /api/user/profile).
    const updateProfile = async (payload: { name?: string; avatarUrl?: string }) => {
        const res = await client.api.user.profile.$patch({ json: payload });
        const data = await unwrap(res);
        setUser(data.user);
        setSubscription(data.subscription);
        return data;
    };

    return {
        user,
        subscription,
        setUser,
        setSubscription,
        clearUser,
        isPro,
        syncUser,
        fetchProfile,
        updateProfile,
    };
};