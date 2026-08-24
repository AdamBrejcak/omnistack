<template>
  <div
    class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4"
  >
    <div
      class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold tracking-tight">
          {{ isSignUp ? "Create an account" : "Welcome back" }}
        </h1>
        <p class="text-sm text-slate-400 mt-2">
          {{
            isSignUp
              ? "Enter your details to get started with OmniStack"
              : "Sign in to access your dashboard"
          }}
        </p>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMessage"
        class="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Full Name (Only on sign up) -->
        <div v-if="isSignUp">
          <label
            class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Full Name
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="John Doe"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <!-- Email Address -->
        <div>
          <label
            class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Email address
          </label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="name@email.com"
            autocomplete="username"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <!-- Password -->
        <div>
          <label
            class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition duration-200 flex items-center justify-center text-sm shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>{{ isSignUp ? "Create account" : "Sign in" }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-800"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-slate-900 px-3 text-slate-500">Or continue with</span>
        </div>
      </div>

      <!-- Google OAuth Button -->
      <button
        @click="handleGoogleLogin"
        :disabled="loading"
        type="button"
        class="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl transition duration-200 flex items-center justify-center gap-3 text-sm cursor-pointer"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google</span>
      </button>

      <!-- Toggle Login / Sign Up -->
      <div class="mt-8 text-center text-xs text-slate-400">
        <span>{{
          isSignUp ? "Already have an account?" : "Don't have an account?"
        }}</span>
        <button
          @click="isSignUp = !isSignUp"
          type="button"
          class="ml-2 text-indigo-400 hover:underline font-medium focus:outline-none cursor-pointer"
        >
          {{ isSignUp ? "Sign in" : "Create account" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useNuxtApp } from "nuxt/app";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";
import { useApi } from "@/composables/useApi";

const { $firebaseAuth } = useNuxtApp();
const { fetchWithAuth } = useApi();
const router = useRouter();

const isSignUp = ref(false);
const email = ref("");
const password = ref("");
const name = ref("");

const loading = ref(false);
const errorMessage = ref("");

const getAuthInstance = (): Auth => {
  const auth = $firebaseAuth as Auth;
  if (!auth) {
    throw new Error(
      "Firebase Auth is not initialized. Please check your environment variables.",
    );
  }
  return auth;
};

const syncUserWithBackend = async (displayName?: string | null) => {
  await fetchWithAuth("api/user/sync", {
    method: "POST",
    body: {
      name: displayName || name.value || "User",
    },
  });
};

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in both email and password.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const auth = getAuthInstance();

    if (isSignUp.value) {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
      await syncUserWithBackend(name.value);
    } else {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    }

    router.push("/dashboard");
  } catch (err: any) {
    console.error("Auth Error:", err);
    errorMessage.value =
      err?.message || "An error occurred during authentication.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    await syncUserWithBackend(credential.user.displayName);

    router.push("/dashboard");
  } catch (err: any) {
    console.error("Google Auth Error:", err);
    errorMessage.value = err?.message || "Google sign-in failed.";
  } finally {
    loading.value = false;
  }
};
</script>
