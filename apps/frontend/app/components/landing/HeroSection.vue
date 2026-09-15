<template>
  <section class="py-20 sm:py-28 text-center">
    <UContainer>
      <UBadge
        color="primary"
        variant="subtle"
        size="lg"
        class="mb-6"
      >
        Serverless · Pay-as-you-go · $0 at idle
      </UBadge>

      <h1
        class="text-4xl sm:text-6xl font-bold tracking-tight text-highlighted max-w-3xl mx-auto"
      >
        Ship a full-stack SaaS without a fixed server bill
      </h1>

      <p class="mt-6 text-lg text-muted max-w-2xl mx-auto">
        OmniStack pairs a Hono API on AWS Lambda with Nuxt 4, Firebase Auth, Neon
        Postgres, and Stripe billing. Every piece scales to zero, so a day with
        no traffic costs nothing.
      </p>

      <div class="mt-10 flex items-center justify-center gap-3 flex-wrap">
        <UButton to="/login" size="xl" class="cursor-pointer">
          Get started free
        </UButton>
        <UButton
          to="#pricing"
          size="xl"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
        >
          See pricing
        </UButton>
      </div>

      <div class="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto text-sm text-muted">
        <div class="flex flex-col items-center gap-1.5">
          <UIcon name="i-lucide-zap" class="size-5 text-primary" />
          AWS Lambda
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <UIcon name="i-lucide-database" class="size-5 text-primary" />
          Neon Postgres
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <UIcon name="i-lucide-shield-check" class="size-5 text-primary" />
          Firebase Auth
        </div>
        <div class="flex flex-col items-center gap-1.5">
          <UIcon name="i-lucide-credit-card" class="size-5 text-primary" />
          Stripe Billing
        </div>
      </div>
    </UContainer>
  </section>
</template>
