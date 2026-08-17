# OmniStack

An opinionated, full-stack SaaS boilerplate for indie hackers and cloud engineers,
built around a strict **zero idle cost** constraint: the whole architecture scales
to zero when unused, while staying type-safe and deployable via infrastructure as
code.

## Stack

- **Infrastructure:** [SST v3](https://sst.dev/) (`sst.config.ts`), deploying to AWS.
- **Backend:** [Hono](https://hono.dev/) running on an AWS Lambda Function URL.
- **Auth:** Firebase Auth (Client SDK on the frontend, Firebase Admin token
  verification on the backend).
- **Database:** Neon serverless PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/).
- **Frontend:** Nuxt 4 + Vue 3 + Tailwind CSS.

## Workspace layout

This is a `pnpm` workspace with three packages:

```
apps/backend    Hono API (AWS Lambda), see apps/backend/README.md
apps/frontend   Nuxt web app, see apps/frontend/README.md
packages/core   Shared Drizzle schema/client, see packages/core/README.md
```

## Prerequisites

- Node.js and [pnpm](https://pnpm.io/).
- An AWS account configured for SST deployment.
- A [Neon](https://neon.tech/) PostgreSQL database.
- A [Firebase](https://firebase.google.com/) project with Email/Password and
  Google sign-in enabled, plus a service account for the backend.

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   Required variables (see `.env.example` for details):

   - `DATABASE_URL` — Neon Postgres connection string.
   - `FIREBASE_SERVICE_ACCOUNT` — Firebase Admin service account JSON, minified
     to a single line (backend only, never exposed to the browser).
   - `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID` — Firebase
     Web app config (used by the frontend Firebase Client SDK).

3. Apply database migrations:

   ```bash
   pnpm db:push
   ```

## Development

Start all apps at once from the repository root:

```bash
pnpm sst dev
```

This runs the backend Lambda and the Nuxt frontend together under `sst dev`,
injecting the environment variables and resource bindings defined in
`sst.config.ts`.

## Database

Schema lives in `packages/core/src/db/schema.ts`. After changing it:

```bash
pnpm db:generate   # generate a new Drizzle migration
pnpm db:push        # apply migrations to DATABASE_URL via `sst shell`
```

## Deployment

Infrastructure is defined in `sst.config.ts` and deploys:

- `Api` — the Hono backend as an `sst.aws.Function` with a public Function URL.
- `Web` — the Nuxt frontend as an `sst.aws.Nuxt` app, wired to the backend's
  Function URL and public Firebase config.

Deploy with the SST CLI (see [SST docs](https://sst.dev/docs/) for stage and
AWS credential setup):

```bash
pnpm sst deploy --stage production
```

## Current status and roadmap

Implemented: Firebase authentication (email/password + Google), a protected
`GET /api/user/me` / `POST /api/user/sync` API, and a Neon/Drizzle `users`
table.

Not yet implemented: S3 file storage, SQS background workers, Stripe billing,
transactional email, and a mobile app. Do not treat roadmap items as
implemented without verifying them in the code.

## Testing and linting

No automated test suite or linter is configured yet. Validate changes using
each app's build (for example `pnpm --filter frontend build`) until tests are
added.
