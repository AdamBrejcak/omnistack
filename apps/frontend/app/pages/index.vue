<template>
  <div class="min-h-screen bg-default text-default font-sans">
    <header class="border-b border-default bg-default/80 backdrop-blur-md sticky top-0 z-50">
      <UContainer class="h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-inverted shadow-lg shadow-primary/30"
          >
            O
          </div>
          <span class="font-semibold text-lg tracking-wide text-highlighted">OmniStack</span>
        </div>

        <nav class="hidden sm:flex items-center gap-6 text-sm font-medium text-muted">
          <a href="#pricing" class="hover:text-highlighted transition-colors">Pricing</a>
          <a href="#faq" class="hover:text-highlighted transition-colors">FAQ</a>
        </nav>

        <div class="flex items-center gap-2">
          <ColorModeToggle />
          <UButton to="/login" class="cursor-pointer">Sign in</UButton>
        </div>
      </UContainer>
    </header>

    <main>
      <LandingHeroSection />
      <LandingCostCalculator />
      <LandingPricingTable />
      <div id="faq">
        <LandingFaqSection />
      </div>
    </main>

    <footer class="border-t border-default py-10">
      <UContainer class="text-center text-sm text-muted">
        Built with Nuxt 4, Hono, and AWS Lambda &mdash; $0 idle cost by design.
      </UContainer>
    </footer>
  </div>
</template>
