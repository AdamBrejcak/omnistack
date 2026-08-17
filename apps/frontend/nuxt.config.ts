export default defineNuxtConfig({
  compatibilityDate: "2026-01-01",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss"
  ],

  plugins: [
    './app/plugins/firebase.client.ts'
  ],

  typescript: {
    tsConfig: {
      compilerOptions: {
        baseUrl: ".",
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.PUBLIC_API_URL || "",
      firebaseApiKey: process.env.FIREBASE_API_KEY || "",
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
    },
  },
});