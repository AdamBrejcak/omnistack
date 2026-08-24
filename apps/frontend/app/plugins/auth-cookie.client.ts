import { onIdTokenChanged, type Auth } from "firebase/auth";

export default defineNuxtPlugin((nuxtApp) => {
    const auth = nuxtApp.$firebaseAuth as Auth;

    const tokenCookie = useCookie("fb_token", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    if (auth) {
        onIdTokenChanged(auth, async (user) => {
            if (user) {
                tokenCookie.value = await user.getIdToken();
            } else {
                tokenCookie.value = null;
            }
        });
    }
});