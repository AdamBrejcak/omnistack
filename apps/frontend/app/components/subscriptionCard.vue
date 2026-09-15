<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-highlighted">
          {{ isPro ? "Pro Plan" : "Free Plan" }}
        </h3>
        <UBadge :color="statusBadge.color" variant="subtle">
          {{ statusBadge.label }}
        </UBadge>
      </div>
    </template>

    <UAlert
      v-if="isPastDue"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Payment failed"
      description="Your last payment failed. Please update your payment details to keep your access."
      class="mb-6"
    />
    <UAlert
      v-else-if="isCanceledPending"
      color="warning"
      variant="subtle"
      icon="i-lucide-info"
      title="Subscription canceling"
      :description="`Your subscription is canceled, but you still have Pro access until ${formattedPeriodEnd}.`"
      class="mb-6"
    />
    <p v-else-if="isPro && formattedPeriodEnd" class="text-muted text-sm mb-6">
      Your plan will automatically renew on
      <span class="text-default font-medium">{{ formattedPeriodEnd }}</span>.
    </p>
    <p v-else class="text-muted text-sm mb-6">
      Upgrade to unlock advanced features, higher limits, and priority support.
    </p>

    <UButton
      v-if="user?.stripeCustomerId"
      block
      size="lg"
      color="neutral"
      variant="outline"
      :loading="loading"
      class="cursor-pointer"
      @click="handleOpenPortal"
    >
      {{ isPastDue ? "Fix Payment Method" : "Manage Subscription" }}
    </UButton>
    <UButton
      v-else
      block
      size="lg"
      :loading="loading"
      class="cursor-pointer"
      @click="handleUpgrade"
    >
      Upgrade to Pro
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { user, subscription, isPro } = useUser();
const { redirectToCheckout, redirectToPortal, loading } = useStripe();
const config = useRuntimeConfig();

const isPastDue = computed(() => subscription.value?.status === "past_due");

const isCanceledPending = computed(() =>
  Boolean(subscription.value?.cancelAtPeriodEnd && isPro.value),
);

const formattedPeriodEnd = computed(() => {
  if (!subscription.value?.currentPeriodEnd) return "";
  return new Date(subscription.value.currentPeriodEnd).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const statusBadge = computed(() => {
  if (isPastDue.value) {
    return { label: "Past Due", color: "error" as const };
  }
  if (isCanceledPending.value) {
    return { label: "Canceling", color: "warning" as const };
  }
  if (isPro.value) {
    return { label: "Active", color: "success" as const };
  }
  return { label: "Free", color: "neutral" as const };
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
