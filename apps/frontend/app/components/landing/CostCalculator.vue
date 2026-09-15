<template>
  <section class="py-20 border-t border-default">
    <UContainer>
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-highlighted">
          The $0 idle-cost calculator
        </h2>
        <p class="mt-4 text-muted">
          No resource in this stack has a fixed monthly charge. Drag the slider to
          see roughly what the compute layer costs at different traffic levels.
        </p>
      </div>

      <UCard class="max-w-2xl mx-auto">
        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-muted font-medium">API requests / month</span>
              <span class="font-mono text-highlighted">{{ formattedRequests }}</span>
            </div>
            <USlider
              v-model="requestsPerMonth"
              :min="0"
              :max="5_000_000"
              :step="10_000"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="rounded-xl border border-default p-4">
              <p class="text-xs text-muted uppercase tracking-wider">
                Traditional always-on server
              </p>
              <p class="mt-2 text-2xl font-bold text-highlighted">$20-100+/mo</p>
              <p class="mt-1 text-xs text-muted">Charged even at zero traffic</p>
            </div>
            <div class="rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p class="text-xs text-muted uppercase tracking-wider">OmniStack (serverless)</p>
              <p class="mt-2 text-2xl font-bold text-primary">{{ formattedCost }}</p>
              <p class="mt-1 text-xs text-muted">Estimated Lambda compute cost</p>
            </div>
          </div>

          <p class="text-xs text-muted">
            Estimate based on
            <a
              href="https://aws.amazon.com/lambda/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              class="underline"
            >published AWS Lambda pricing</a>
            ($0.20 per 1M requests, $0.0000166667 per GB-second, with 1M requests
            and 400,000 GB-seconds free every month), assuming ~200ms average
            duration at 512MB memory per request. It excludes S3, Neon, Firebase
            Auth, and Stripe fees, which are also usage-based and $0 at zero
            traffic on their own free tiers. Actual costs depend on your
            configuration and current provider pricing.
          </p>
        </div>
      </UCard>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const requestsPerMonth = ref(100_000);

const FREE_REQUESTS = 1_000_000;
const FREE_GB_SECONDS = 400_000;
const AVG_DURATION_SECONDS = 0.2;
const MEMORY_GB = 0.5;
const PRICE_PER_MILLION_REQUESTS = 0.2;
const PRICE_PER_GB_SECOND = 0.0000166667;

const estimatedMonthlyCost = computed(() => {
  const requests = requestsPerMonth.value;
  const gbSeconds = requests * AVG_DURATION_SECONDS * MEMORY_GB;

  const billableRequests = Math.max(0, requests - FREE_REQUESTS);
  const billableGbSeconds = Math.max(0, gbSeconds - FREE_GB_SECONDS);

  const requestCost = (billableRequests / 1_000_000) * PRICE_PER_MILLION_REQUESTS;
  const computeCost = billableGbSeconds * PRICE_PER_GB_SECOND;

  return requestCost + computeCost;
});

const formattedRequests = computed(() => requestsPerMonth.value.toLocaleString("en-US"));

const formattedCost = computed(() =>
  estimatedMonthlyCost.value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
);
</script>
