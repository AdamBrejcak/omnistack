// apps/frontend/nuxt.config.ts
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
      firebaseApiKey: process.env.PUBLIC_FIREBASE_API_KEY || "",
      firebaseAuthDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      firebaseProjectId: process.env.PUBLIC_FIREBASE_PROJECT_ID || "",
    },
  },
});