<template>
  <div>
    <!-- Button for PRO users -->
    <button
      v-if="isPro"
      @click="handleOpenPortal"
      :disabled="loading"
      class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-200 flex items-center justify-center gap-2"
    >
      <span
        v-if="loading"
        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
      ></span>
      <span>Manage Subscription</span>
    </button>

    <!-- Button for FREE users -->
    <button
      v-else
      @click="handleUpgrade"
      :disabled="loading"
      class="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
    >
      <span
        v-if="loading"
        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
      ></span>
      <span>Upgrade to Pro</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { user } = useUser();
const { redirectToPortal, redirectToCheckout, loading } = useStripe();

const isPro = computed(() => !!user.value?.stripeCustomerId);
const config = useRuntimeConfig();

const handleOpenPortal = () => {
  if (user.value?.stripeCustomerId) {
    redirectToPortal(user.value.stripeCustomerId, window.location.href);
  }
};

const handleUpgrade = () => {
  if (!user.value) return;

  redirectToCheckout({
    priceId: config.public.stripePriceIdPro,
    mode: "subscription",
    userId: user.value.id,
    userEmail: user.value.email,
  });
};
</script>
