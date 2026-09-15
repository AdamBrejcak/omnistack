# frontend

Nuxt 4 + Vue 3 + Tailwind CSS web app for OmniStack, deployed via SST as
`sst.aws.Nuxt`.

## Stack

- Nuxt 4 / Vue 3, styled with Tailwind CSS via [Nuxt UI v3](https://ui.nuxt.com/)
  (`@nuxt/ui`'s bundled CSS-first Tailwind setup — no separate Tailwind
  module), including its built-in dark/light color mode.
- Firebase Client SDK for email/password and Google sign-in
  (`app/plugins/firebase.client.ts`), with the ID token mirrored into an
  `fb_token` cookie (`app/plugins/auth-cookie.client.ts`) so the route
  middleware can check auth state during SSR.
- `useApi()` composable builds a type-safe [Hono RPC](https://hono.dev/docs/guides/rpc)
  client (`hc<AppType>()`) against `config.public.apiUrl` (the deployed Lambda
  Function URL), attaching the current user's Firebase ID token as a Bearer
  header automatically.

## Requirements

Environment variables, loaded from the repository root `.env`
(see root `.env.example`):

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `STRIPE_PRICE_ID_PRO` — the Pro plan's Stripe Price id, used by the pricing
  table and the dashboard's "Upgrade to Pro" button.

`PUBLIC_API_URL` is set automatically by `sst.config.ts` from the deployed
backend Lambda Function URL; you do not need to set it by hand when running
through SST.

## Pages

- `app/pages/index.vue` — **public** marketing landing page (hero, $0
  idle-cost calculator, pricing table, FAQ). Authenticated users are
  redirected straight to `/dashboard`.
- `app/pages/login.vue` — email/password sign-in and sign-up (toggled on one
  page), plus Google OAuth. On account creation (sign-up or first Google
  sign-in), calls `POST /api/user/sync` to persist the user in Postgres.
- `app/pages/dashboard.vue` — **protected** page; redirects to `/login` if not
  authenticated. Shows profile data, avatar upload, and the subscription/
  billing card.

`app/middleware/auth.global.ts` enforces this: unauthenticated visitors can
only see `/` and `/login`; authenticated users are redirected away from both
to `/dashboard`.

## Composables

- `useApi()` — the Hono RPC client + `unwrap()` helper for the `ApiResponse<T>`
  envelope.
- `useUser()` — shared auth/subscription state (`user`, `subscription`,
  `isPro`), plus `syncUser()`, `fetchProfile()`, and `updateProfile()`, which
  wrap the corresponding `/api/user/*` calls. Components should go through
  these rather than calling the RPC client directly.
- `useStripe()` — `redirectToCheckout()` / `redirectToPortal()`, calling
  `/api/stripe/checkout` and `/api/stripe/portal` and redirecting to the
  returned hosted Stripe URL.
- `useProfileUpload()` — requests a presigned URL from
  `/api/uploads/profile-image`, then `PUT`s the file directly to S3 from the
  browser.

## Development

Run from the repository root, alongside the backend:

```bash
pnpm dev
```

Starts the Nuxt dev server together with the backend Lambda (`sst dev`) and a
Stripe CLI webhook tunnel.

## Production build

```bash
pnpm --filter @omnistack/frontend build
```

## Project structure

```
app/
  pages/
    index.vue              Public landing page
    login.vue               Sign-in / sign-up
    dashboard.vue            Protected dashboard
  components/
    landing/                 HeroSection, CostCalculator, PricingTable, FaqSection
    ColorModeToggle.vue       Shared dark/light toggle
    avatarUpload.vue          Avatar picker + upload UI
    profileForm.vue           Name/avatar edit form
    subscriptionCard.vue      Plan badge + upgrade/billing-portal button
  composables/
    useApi.ts                 Hono RPC client + unwrap()
    useUser.ts                 Shared user/subscription state + sync/fetch/update
    useStripe.ts               Checkout/portal redirects
    useProfileUpload.ts         Presigned S3 upload flow
  middleware/auth.global.ts   Public vs. protected route redirects
  plugins/
    firebase.client.ts        Firebase Client SDK initialization
    auth-cookie.client.ts      Mirrors Firebase ID token into an SSR-readable cookie
nuxt.config.ts                Public runtime config (Firebase config, API URL, Stripe price id)
```
