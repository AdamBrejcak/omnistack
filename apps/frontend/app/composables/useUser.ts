import type { User } from "@omnistack/core/db";

export const useUser = () => {
    const user = useState<User | null>('auth-user', () => null)

    const setUser = (data: Partial<User> | null) => {
        if (!data) {
            user.value = null
            return
        }
        user.value = user.value ? { ...user.value, ...data } : (data as User)
    }

    return { user, setUser }
}