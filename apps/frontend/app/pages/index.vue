<template>
  <div>
    <ClientOnly>
      <div class="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <!-- Header -->
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
              <div
                v-if="user"
                class="flex items-center gap-3 pr-2 border-r border-slate-800"
              >
                <img
                  v-if="user.avatarUrl"
                  :src="user.avatarUrl"
                  alt="User avatar"
                  class="w-9 h-9 rounded-full object-cover border border-slate-700 ring-2 ring-indigo-500/20"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-medium text-slate-300 shadow-inner"
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

              <button
                @click="handleLogout"
                class="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-200 border border-slate-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <!-- Success banner after returning from Stripe checkout -->
          <div
            v-if="showSuccessBanner"
            class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-emerald-400"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p class="font-semibold text-sm sm:text-base">
                  Payment successful!
                </p>
                <p class="text-xs sm:text-sm text-emerald-400/80">
                  Your subscription status is being updated.
                </p>
              </div>
            </div>
            <button
              @click="showSuccessBanner = false"
              class="text-emerald-400 hover:text-emerald-200 text-sm"
            >
              ✕
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="pending" class="flex items-center justify-center py-20">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"
            ></div>
          </div>

          <template v-else>
            <!-- Hero Welcome -->
            <div
              class="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-6"
            >
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-white">
                  Welcome back, {{ user?.name || "Developer" }}! 👋
                </h1>
                <p class="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
                  Your account is synced with Neon Postgres DB via Hono API.
                  Manage your profile, billing, and subscription below.
                </p>
              </div>
              <img
                v-if="user?.avatarUrl"
                :src="user.avatarUrl"
                class="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 hidden md:block shadow-lg"
              />
            </div>

            <!-- Dashboard Stats Cards -->
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
                  <span class="text-2xl font-bold text-emerald-400"
                    >Active</span
                  >
                  <span
                    class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20"
                    >Synced</span
                  >
                </div>
              </div>

              <!-- Subscription Plan Card -->
              <div
                class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition"
              >
                <p
                  class="text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  Subscription Plan
                </p>
                <div class="mt-2 flex items-baseline justify-between">
                  <span
                    class="text-2xl font-bold"
                    :class="isPro ? 'text-indigo-400' : 'text-slate-300'"
                  >
                    {{ isPro ? "Pro Plan" : "Free Plan" }}
                  </span>
                  <span
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full border',
                      statusBadge.class,
                    ]"
                  >
                    {{ statusBadge.text }}
                  </span>
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
                  <span class="text-2xl font-bold text-white"
                    >Neon PostgreSQL</span
                  >
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
                  <span class="text-2xl font-bold text-amber-400"
                    >Hono + AWS</span
                  >
                </div>
              </div>
            </div>

            <!-- Stripe Billing Section -->
            <div
              class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    Stripe Payments Integrated
                  </span>
                  <span
                    v-if="isCanceling"
                    class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  >
                    Cancels on {{ formattedPeriodEnd }}
                  </span>
                </div>
                <h2 class="text-xl font-bold text-white">
                  {{
                    isPro ? "You are on the Pro Plan" : "Upgrade to Pro Plan"
                  }}
                </h2>
                <p class="text-sm text-slate-400 max-w-xl">
                  {{
                    isCanceling
                      ? `Your Pro subscription is set to cancel at the end of the billing cycle (${formattedPeriodEnd}). You retain full access until then.`
                      : isPro
                        ? "Manage your payment details, invoices, or change subscription preferences."
                        : "Get access to advanced OmniStack features, priority AWS compute, and unlimited DB connections."
                  }}
                </p>
              </div>

              <div class="flex items-center gap-4 w-full md:w-auto">
                <PricingCard />
              </div>
            </div>

            <!-- Profile Data Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div
                class="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl"
              >
                <div
                  class="px-6 py-4 border-b border-slate-800 bg-slate-900/80"
                >
                  <h2 class="text-base font-semibold text-white">
                    Your Profile Data (Fetched via Hono API)
                  </h2>
                </div>
                <div
                  class="divide-y divide-slate-800/60 text-sm bg-slate-900/40"
                >
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium">User ID</span>
                    <span
                      class="col-span-2 sm:col-span-3 font-mono text-xs text-indigo-300 break-all bg-slate-950/60 p-2 rounded border border-slate-800"
                    >
                      {{ user?.id }}
                    </span>
                  </div>
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium">Full Name</span>
                    <span
                      class="col-span-2 sm:col-span-3 text-slate-200 font-medium text-base"
                    >
                      {{ user?.name }}
                    </span>
                  </div>
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium"
                      >Email Address</span
                    >
                    <span class="col-span-2 sm:col-span-3 text-slate-200">{{
                      user?.email
                    }}</span>
                  </div>
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium"
                      >Subscription Status</span
                    >
                    <span class="col-span-2 sm:col-span-3 text-slate-200">
                      {{ subscriptionStatusText }}
                    </span>
                  </div>
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium"
                      >Stripe Customer</span
                    >
                    <span
                      class="col-span-2 sm:col-span-3 font-mono text-xs text-slate-300 break-all"
                    >
                      {{ user?.stripeCustomerId || "Not created yet" }}
                    </span>
                  </div>
                  <div
                    class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center"
                  >
                    <span class="text-slate-400 font-medium">Created At</span>
                    <span class="col-span-2 sm:col-span-3 text-slate-200">
                      {{
                        user?.createdAt
                          ? new Date(user.createdAt).toLocaleString()
                          : "Recently"
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-1">
                <ProfileForm :user="user" @updated="handleUserUpdated" />
              </div>
            </div>
          </template>
        </main>
      </div>

      <template #fallback>
        <div class="min-h-screen bg-slate-950 flex items-center justify-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"
          ></div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onAuthStateChanged, signOut, type Auth } from "firebase/auth";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useNuxtApp } from "nuxt/app";
import type { User, Subscription } from "@omnistack/core/db";

const router = useRouter();
const route = useRoute();
const { fetchWithAuth } = useApi();
const { $firebaseAuth } = useNuxtApp();

// Use isPro and subscription directly from the useUser composable
const { user, subscription, setUser, setSubscription, clearUser, isPro } =
  useUser();

const pending = ref(true);
const showSuccessBanner = ref(false);

// Check if subscription is set to cancel at period end
const isCanceling = computed(() => {
  if (!subscription.value) return false;
  return Boolean(subscription.value.cancelAtPeriodEnd);
});

// Format current period end date
const formattedPeriodEnd = computed(() => {
  if (!subscription.value?.currentPeriodEnd) return null;
  return new Date(subscription.value.currentPeriodEnd).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
});

// Status badge appearance and label
const statusBadge = computed(() => {
  if (!isPro.value) {
    return {
      text: "Free",
      class: "bg-slate-800 text-slate-400 border-slate-700",
    };
  }
  if (isCanceling.value) {
    return {
      text: "Canceling",
      class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  return {
    text: "Active",
    class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
});

const subscriptionStatusText = computed(() => {
  if (isCanceling.value) return "Canceling (Active until period end)";
  if (isPro.value) return "Active";
  return "Free / Inactive";
});

let unsubscribe: (() => void) | null = null;

// Fetch user profile and set both user and subscription state
const loadUserProfile = async () => {
  try {
    const response = await fetchWithAuth<{
      user: User;
      subscription?: Subscription | null;
    }>("api/user/profile");

    if (response) {
      if (response.user) {
        setUser(response.user);
      }

      const subData = response.subscription;
      if (subData) {
        setSubscription(subData);
      }
    }
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }
};

onMounted(() => {
  const auth = $firebaseAuth as Auth;

  if (route.query.success === "true") {
    showSuccessBanner.value = true;
    router.replace({ query: {} });
  }

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearUser();
      router.push("/login");
      return;
    }

    await loadUserProfile();
    pending.value = false;

    if (route.query.success === "true" || showSuccessBanner.value) {
      if (!subscription.value) {
        setTimeout(async () => {
          await loadUserProfile();
        }, 1500);
      }
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
    clearUser();
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
};

const handleUserUpdated = (updatedData: Partial<User>) => {
  setUser(updatedData);
};
</script>
