<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans">
    <!-- Navigation Bar -->
    <header
      class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30"
          >
            O
          </div>
          <span class="font-semibold text-lg tracking-wide text-white"
            >OmniStack</span
          >
        </div>

        <div class="flex items-center gap-4">
          <!-- User Profile Summary in Header -->
          <div
            v-if="user"
            class="flex items-center gap-3 pr-2 border-r border-slate-800"
          >
            <div
              class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-medium text-slate-300"
            >
              {{ user.name ? user.name.charAt(0).toUpperCase() : "U" }}
            </div>
            <div class="hidden sm:block text-sm">
              <p class="font-medium text-slate-200 leading-none">
                {{ user.name }}
              </p>
              <p class="text-xs text-slate-400 mt-1 leading-none">
                {{ user.email }}
              </p>
            </div>
          </div>

          <!-- Sign Out Button -->
          <button
            @click="handleLogout"
            class="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-200 border border-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <!-- Main Dashboard Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Loading State Spinner -->
      <div v-if="pending" class="flex items-center justify-center py-20">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"
        ></div>
      </div>

      <!-- Dashboard Grid Container -->
      <template v-else>
        <!-- Welcome Hero Section -->
        <div
          class="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 sm:p-8"
        >
          <h1 class="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {{ user?.name || "Developer" }}! 👋
          </h1>
          <p class="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
            Your account is synced with Neon Postgres DB. You're logged in with
            UID:
            <code
              class="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-mono text-xs"
              >{{ user?.id }}</code
            >
          </p>
        </div>

        <!-- Metric Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <p
              class="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Account Status
            </p>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-emerald-400">Active</span>
              <span
                class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20"
                >Synced</span
              >
            </div>
          </div>

          <div
            class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <p
              class="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Database
            </p>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-white">Neon PostgreSQL</span>
            </div>
          </div>

          <div
            class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <p
              class="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Auth Provider
            </p>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-indigo-400">Firebase</span>
            </div>
          </div>

          <div
            class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition"
          >
            <p
              class="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              API Architecture
            </p>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-amber-400">Hono + AWS</span>
            </div>
          </div>
        </div>

        <!-- User Profile Details Table -->
        <div
          class="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-800">
            <h2 class="text-base font-semibold text-white">
              Your Profile Data (/api/user/me)
            </h2>
          </div>
          <div class="divide-y divide-slate-800/60 text-sm">
            <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4">
              <span class="text-slate-400 font-medium">User ID</span>
              <span
                class="col-span-2 sm:col-span-3 font-mono text-xs text-indigo-300 break-all"
                >{{ user?.id }}</span
              >
            </div>
            <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4">
              <span class="text-slate-400 font-medium">Full Name</span>
              <span class="col-span-2 sm:col-span-3 text-slate-200">{{
                user?.name
              }}</span>
            </div>
            <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4">
              <span class="text-slate-400 font-medium">Email Address</span>
              <span class="col-span-2 sm:col-span-3 text-slate-200">{{
                user?.email
              }}</span>
            </div>
            <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4">
              <span class="text-slate-400 font-medium">Created At</span>
              <span class="col-span-2 sm:col-span-3 text-slate-200">{{
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "Just now"
              }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useNuxtApp } from "nuxt/app";
import { onAuthStateChanged, signOut, type Auth } from "firebase/auth";
import { useApi } from "../../composables/useApi";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

const router = useRouter();
const { fetchWithAuth } = useApi();
const { $firebaseAuth } = useNuxtApp();

const user = ref<UserProfile | null>(null);
const pending = ref(true);

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const auth = $firebaseAuth as Auth;

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetchWithAuth<{ user: UserProfile }>(
        "api/user/me",
      );
      user.value = response.user;
    } catch (err) {
      console.error("Failed to load user profile:", err);
      router.push("/login");
    } finally {
      pending.value = false;
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const handleLogout = async () => {
  try {
    const auth = $firebaseAuth as Auth;
    await signOut(auth);
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
};
</script>
