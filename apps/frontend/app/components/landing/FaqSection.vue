<template>
  <section class="py-20 border-t border-default">
    <UContainer>
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-highlighted">
          Frequently asked questions
        </h2>
      </div>

      <div class="max-w-2xl mx-auto">
        <UAccordion :items="items" />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const items = [
  {
    label: "Why does this actually cost $0 when idle?",
    content:
      "Every service in the stack (AWS Lambda, S3, Neon Postgres, Firebase Auth, Stripe) bills per request, per GB, or per transaction, not per month. If nobody uses the app, nothing runs, and nothing is charged.",
  },
  {
    label: "How do I sign in?",
    content:
      "You can sign up or sign in with email and password, or with your Google account, both from the same sign-in page.",
  },
  {
    label: "Where is my data stored?",
    content:
      "Your account and subscription data live in a serverless Neon Postgres database. Uploaded avatars are stored directly in an S3 bucket.",
  },
  {
    label: "Can I cancel my subscription anytime?",
    content:
      "Yes. Once you're on the Pro plan, the dashboard's billing card links to the Stripe Customer Portal, where you can update payment details or cancel at any time.",
  },
  {
    label: "What happens to my data if I cancel?",
    content:
      "Your account stays intact. Canceling only changes your subscription status and access to Pro-only features; your profile and history remain.",
  },
];
</script>
