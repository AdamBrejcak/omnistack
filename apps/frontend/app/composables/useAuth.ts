import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type Auth
} from "firebase/auth";

export const useAuth = () => {
    const { $firebaseAuth } = useNuxtApp();
    const auth = $firebaseAuth as Auth;
    const tokenCookie = useCookie("fb_token");

    const login = async (email: string, pass: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        tokenCookie.value = await userCredential.user.getIdToken();
        await navigateTo("/");
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        tokenCookie.value = null;
        await navigateTo("/login");
    };

    return {
        login,
        logout,
    };
};