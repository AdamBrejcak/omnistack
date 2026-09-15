<template>
  <div>
    <ClientOnly>
      <div class="min-h-screen bg-default text-default font-sans">
        <!-- Header -->
        <header
          class="border-b border-default bg-default/80 backdrop-blur-md sticky top-0 z-50"
        >
          <UContainer class="h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-inverted shadow-lg shadow-primary/30"
              >
                O
              </div>
              <span class="font-semibold text-lg tracking-wide text-highlighted">
                OmniStack
              </span>
            </div>

            <div class="flex items-center gap-2">
              <UButton
                :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
                color="neutral"
                variant="ghost"
                class="cursor-pointer"
                @click="toggleColorMode"
              />

              <UDropdownMenu :items="userMenuItems" :ui="{ content: 'w-56' }">
                <UButton color="neutral" variant="ghost" class="pl-1.5 pr-2 cursor-pointer">
                  <UAvatar :src="user?.avatarUrl ?? undefined" :alt="user?.name || 'User'" size="sm" />
                  <span class="hidden sm:block text-sm font-medium text-default">
                    {{ user?.name }}
                  </span>
                  <UIcon name="i-lucide-chevron-down" class="size-4 text-muted" />
                </UButton>
              </UDropdownMenu>
            </div>
          </UContainer>
        </header>

        <UContainer class="py-8 space-y-8">
          <!-- Success banner after returning from Stripe checkout -->
          <UAlert
            v-if="showSuccessBanner"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            title="Payment successful!"
            description="Your subscription status is being updated."
            :close-button="{ icon: 'i-lucide-x', color: 'success', variant: 'link' }"
            @close="showSuccessBanner = false"
          />

          <!-- Loading State -->
          <div v-if="pending" class="flex items-center justify-center py-20">
            <UIcon name="i-lucide-loader-circle" class="size-8 text-primary animate-spin" />
          </div>

          <template v-else>
            <!-- Hero Welcome -->
            <UCard
              :ui="{ body: 'flex items-center justify-between gap-6' }"
              class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
            >
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-highlighted">
                  Welcome back, {{ user?.name || "Developer" }}! 👋
                </h1>
                <p class="text-muted mt-2 max-w-2xl text-sm sm:text-base">
                  Your account is synced with Neon Postgres DB via Hono API.
                  Manage your profile, billing, and subscription below.
                </p>
              </div>
              <UAvatar
                v-if="user?.avatarUrl"
                :src="user.avatarUrl"
                :alt="user.name || 'User'"
                size="3xl"
                class="hidden md:block ring-2 ring-primary/30"
              />
            </UCard>

            <!-- Dashboard Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UCard>
                <p class="text-xs font-medium text-muted uppercase tracking-wider">
                  Account Status
                </p>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-2xl font-bold text-success">Active</span>
                  <UBadge color="success" variant="subtle">Synced</UBadge>
                </div>
              </UCard>

              <UCard>
                <p class="text-xs font-medium text-muted uppercase tracking-wider">
                  Subscription Plan
                </p>
                <div class="mt-2 flex items-baseline justify-between">
                  <span
                    class="text-2xl font-bold"
                    :class="isPro ? 'text-primary' : 'text-default'"
                  >
                    {{ isPro ? "Pro Plan" : "Free Plan" }}
                  </span>
                  <UBadge :color="statusBadge.color" variant="subtle">
                    {{ statusBadge.text }}
                  </UBadge>
                </div>
              </UCard>

              <UCard>
                <p class="text-xs font-medium text-muted uppercase tracking-wider">
                  Database
                </p>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-2xl font-bold text-highlighted">Neon PostgreSQL</span>
                </div>
              </UCard>

              <UCard>
                <p class="text-xs font-medium text-muted uppercase tracking-wider">
                  API Architecture
                </p>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-2xl font-bold text-warning">Hono + AWS</span>
                </div>
              </UCard>
            </div>

            <!-- Stripe Billing Section -->
            <SubscriptionCard />

            <!-- Profile Data Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <UCard class="lg:col-span-2" :ui="{ body: 'p-0 divide-y divide-default' }">
                <template #header>
                  <h2 class="text-base font-semibold text-highlighted">
                    Your Profile Data (Fetched via Hono API)
                  </h2>
                </template>

                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">User ID</span>
                  <span
                    class="col-span-2 sm:col-span-3 font-mono text-xs text-primary break-all bg-muted p-2 rounded border border-default"
                  >
                    {{ user?.id }}
                  </span>
                </div>
                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">Full Name</span>
                  <span class="col-span-2 sm:col-span-3 text-default font-medium text-base">
                    {{ user?.name }}
                  </span>
                </div>
                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">Email Address</span>
                  <span class="col-span-2 sm:col-span-3 text-default">{{ user?.email }}</span>
                </div>
                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">Subscription Status</span>
                  <span class="col-span-2 sm:col-span-3 text-default">
                    {{ subscriptionStatusText }}
                  </span>
                </div>
                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">Stripe Customer</span>
                  <span class="col-span-2 sm:col-span-3 font-mono text-xs text-default break-all">
                    {{ user?.stripeCustomerId || "Not created yet" }}
                  </span>
                </div>
                <div class="px-6 py-3.5 grid grid-cols-3 sm:grid-cols-4 items-center text-sm">
                  <span class="text-muted font-medium">Created At</span>
                  <span class="col-span-2 sm:col-span-3 text-default">
                    {{ user?.createdAt ? new Date(user.createdAt).toLocaleString() : "Recently" }}
                  </span>
                </div>
              </UCard>

              <div class="lg:col-span-1">
                <ProfileForm :user="user" @updated="handleUserUpdated" />
              </div>
            </div>
          </template>
        </UContainer>
      </div>

      <template #fallback>
        <div class="min-h-screen bg-default flex items-center justify-center">
          <UIcon name="i-lucide-loader-circle" class="size-8 text-primary animate-spin" />
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
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ClientUser } from "../composables/useUser";

const router = useRouter();
const route = useRoute();
const { client } = useApi();
const { $firebaseAuth } = useNuxtApp();
const colorMode = useColorMode();

// Use isPro and subscription directly from the useUser composable
const { user, subscription, setUser, setSubscription, clearUser, isPro } =
  useUser();

const pending = ref(true);
const showSuccessBanner = ref(false);

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

// Check if subscription is set to cancel at period end
const isCanceling = computed(() => {
  if (!subscription.value) return false;
  return Boolean(subscription.value.cancelAtPeriodEnd);
});

// Status badge appearance and label
const statusBadge = computed(() => {
  if (!isPro.value) {
    return { text: "Free", color: "neutral" as const };
  }
  if (isCanceling.value) {
    return { text: "Canceling", color: "warning" as const };
  }
  return { text: "Active", color: "primary" as const };
});

const subscriptionStatusText = computed(() => {
  if (isCanceling.value) return "Canceling (Active until period end)";
  if (isPro.value) return "Active";
  return "Free / Inactive";
});

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.email || "",
      type: "label",
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-lucide-log-out",
      color: "error",
      onSelect: handleLogout,
    },
  ],
]);

let unsubscribe: (() => void) | null = null;

// Fetch user profile and set both user and subscription state
const loadUserProfile = async () => {
  try {
    const res = await client.api.user.profile.$get();
    const data = await unwrap(res);

    if (data.user) {
      setUser(data.user);
    }

    if (data.subscription) {
      setSubscription(data.subscription);
    }
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }
};

// Helper to poll profile API repeatedly until Webhook updates database to Pro
const pollUserProfileUntilPro = async (maxRetries = 6, delayMs = 1500) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await loadUserProfile();
    if (isPro.value) {
      break; // Webhook processed and user is Pro -> stop polling
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
};

onMounted(() => {
  const auth = $firebaseAuth as Auth;

  const isSuccessRedirect = route.query.success === "true";

  if (isSuccessRedirect) {
    showSuccessBanner.value = true;
    router.replace({ query: {} }); // Clear query parameters from URL
  }

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      clearUser();
      router.push("/login");
      return;
    }

    // 1. Initial profile load
    await loadUserProfile();
    pending.value = false;

    // 2. If returning from Stripe checkout and not yet Pro, repeatedly check status (polling)
    if ((isSuccessRedirect || showSuccessBanner.value) && !isPro.value) {
      await pollUserProfileUntilPro();
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

async function handleLogout() {
  try {
    const auth = $firebaseAuth as Auth;
    await signOut(auth);
    clearUser();
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
}

const handleUserUpdated = (updatedData: Partial<ClientUser>) => {
  setUser(updatedData);
};
</script>
