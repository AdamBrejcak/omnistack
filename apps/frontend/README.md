# frontend

Nuxt 4 + Vue 3 + Tailwind CSS web app for OmniStack, deployed via SST as
`sst.aws.Nuxt`.

## Stack

- Nuxt 4 / Vue 3, Tailwind CSS (`@nuxtjs/tailwindcss`).
- Firebase Client SDK for email/password and Google sign-in
  (`app/plugins/firebase.client.ts`).
- `useApi()` composable attaches the current user's Firebase ID token as a
  Bearer token and calls the backend API directly at `config.public.apiUrl`
  (the deployed Lambda Function URL).

## Requirements

Environment variables, loaded from the repository root `.env`
(see root `.env.example`):

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`

`PUBLIC_API_URL` is set automatically by `sst.config.ts` from the deployed
backend Lambda Function URL; you do not need to set it by hand when running
through SST.

## Pages

- `app/pages/login.vue` — email/password sign-in and sign-up, plus Google
  OAuth. On account creation (sign-up or first Google sign-in), calls
  `POST /api/user/sync` to persist the user in Postgres.
- `app/pages/dashboard.vue` — protected page; redirects to `/login` if not
  authenticated, fetches the current user via `GET /api/user/profile`.

## Development

Run from the repository root, alongside the backend:

```bash
pnpm sst dev
```

Starts the Nuxt dev server on `http://localhost:3000` together with the
backend Lambda.

## Production build

```bash
pnpm --filter frontend build
```

## Project structure

```
app/
  pages/                login.vue, dashboard.vue
  plugins/firebase.client.ts   Firebase Client SDK initialization
composables/useApi.ts    Authenticated fetch helper (attaches Firebase ID token)
nuxt.config.ts           Public runtime config (Firebase config, API URL)
```
