<template>
  <section id="pricing" class="py-20 border-t border-default">
    <UContainer>
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-highlighted">Simple pricing</h2>
        <p class="mt-4 text-muted">
          Start for free. Upgrade whenever you need more, cancel anytime from the
          billing portal.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold text-highlighted">Free</h3>
          </template>

          <p class="text-3xl font-bold text-highlighted mb-1">
            $0<span class="text-base font-normal text-muted">/mo</span>
          </p>
          <p class="text-sm text-muted mb-6">For trying things out.</p>

          <ul class="space-y-3 text-sm text-default mb-6">
            <li v-for="feature in freeFeatures" :key="feature" class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-primary mt-0.5 shrink-0" />
              {{ feature }}
            </li>
          </ul>

          <UButton to="/login" block size="lg" color="neutral" variant="outline" class="cursor-pointer">
            Get started
          </UButton>
        </UCard>

        <div class="relative">
          <UBadge color="primary" variant="solid" class="absolute -top-3 right-6 z-10">
            Popular
          </UBadge>

          <UCard class="ring-2 ring-primary/50">
            <template #header>
              <h3 class="text-xl font-bold text-highlighted">Pro</h3>
            </template>

            <p class="text-3xl font-bold text-highlighted mb-1">
              $19<span class="text-base font-normal text-muted">/mo</span>
            </p>
            <p class="text-sm text-muted mb-6">For shipping to real users.</p>

            <ul class="space-y-3 text-sm text-default mb-6">
              <li v-for="feature in proFeatures" :key="feature" class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="size-4 text-primary mt-0.5 shrink-0" />
                {{ feature }}
              </li>
            </ul>

            <UButton
              :to="proCtaDisabled ? undefined : '/login'"
              :disabled="proCtaDisabled"
              block
              size="lg"
              class="cursor-pointer"
            >
              {{ proCtaDisabled ? "Pro plan coming soon" : "Sign in to upgrade" }}
            </UButton>
          </UCard>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const config = useRuntimeConfig();

// The landing page is only ever shown to signed-out visitors (the auth
// middleware redirects authenticated users to /dashboard), so upgrading
// happens after sign-in via the dashboard's SubscriptionCard, which is the
// component that actually calls the Stripe checkout endpoint.
const proCtaDisabled = computed(() => !config.public.stripePriceIdPro);

const freeFeatures = [
  "Firebase email & Google sign-in",
  "Profile with avatar upload",
  "Full access to the dashboard",
];

const proFeatures = [
  "Everything in Free",
  "Priority support",
  "Higher usage limits",
  "Manage billing anytime via Stripe",
];
</script>
