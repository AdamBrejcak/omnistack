<template>
  <div
    class="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-w-md w-full"
  >
    <!-- Header with Plan Name & Status Badge -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-white">
        {{ isPro ? "Pro Plan" : "Free Plan" }}
      </h3>
      <span
        :class="[
          'px-3 py-1 rounded-full text-xs font-semibold border',
          statusBadge.color,
        ]"
      >
        {{ statusBadge.label }}
      </span>
    </div>

    <!-- Alert: Payment Failed (past_due) -->
    <div
      v-if="isPastDue"
      class="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm"
    >
      ⚠️ Your last payment failed. Please update your payment details to keep
      your access.
    </div>

    <!-- Alert: Cancellation Pending -->
    <div
      v-else-if="isCanceledPending"
      class="mb-4 p-3 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-300 text-sm"
    >
      ℹ️ Your subscription is canceled, but you still have Pro access until
      <strong class="text-white">{{ formattedPeriodEnd }}</strong
      >.
    </div>

    <!-- Info: Active Renews Date -->
    <p
      v-else-if="isPro && formattedPeriodEnd"
      class="text-slate-400 text-sm mb-6"
    >
      Your plan will automatically renew on
      <span class="text-slate-200 font-medium">{{ formattedPeriodEnd }}</span
      >.
    </p>

    <!-- Info: Free Tier -->
    <p v-else class="text-slate-400 text-sm mb-6">
      Upgrade to unlock advanced features, higher limits, and priority support.
    </p>

    <!-- Action Buttons -->
    <div class="mt-6">
      <!-- Button for Users with Existing Stripe Customer ID -> Stripe Customer Portal -->
      <button
        v-if="user?.stripeCustomerId"
        @click="handleOpenPortal"
        :disabled="loading"
        class="w-full py-3 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition duration-200 flex items-center justify-center gap-2"
      >
        <span
          v-if="loading"
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
        ></span>
        <span>{{
          isPastDue ? "Fix Payment Method" : "Manage Subscription"
        }}</span>
      </button>

      <!-- Button for New / Free Users without Customer ID -> Stripe Checkout -->
      <button
        v-else
        @click="handleUpgrade"
        :disabled="loading"
        class="w-full py-3 px-4 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
      >
        <span
          v-if="loading"
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
        ></span>
        <span>Upgrade to Pro</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, subscription, isPro } = useUser();
const { redirectToCheckout, redirectToPortal, loading } = useStripe();
const config = useRuntimeConfig();

// Odvodené stavy pre UI
const isPastDue = computed(() => subscription.value?.status === "past_due");

const isCanceledPending = computed(() =>
  Boolean(subscription.value?.cancelAtPeriodEnd && isPro.value),
);

const formattedPeriodEnd = computed(() => {
  if (!subscription.value?.currentPeriodEnd) return "";
  return new Date(subscription.value.currentPeriodEnd).toLocaleDateString(
    "sk-SK",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
});

const statusBadge = computed(() => {
  if (isPastDue.value) {
    return {
      label: "Past Due",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
    };
  }
  if (isCanceledPending.value) {
    return {
      label: "Canceling",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  if (isPro.value) {
    return {
      label: "Active",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  }
  return {
    label: "Free",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
});

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
    stripeCustomerId: user.value.stripeCustomerId || undefined,
  });
};
</script>
