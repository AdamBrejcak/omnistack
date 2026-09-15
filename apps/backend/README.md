# @omnistack/backend

Hono API deployed as a single AWS Lambda function via SST, using an AWS Lambda Function URL.

## Stack

- [Hono](https://hono.dev/) HTTP framework, running via `hono/aws-lambda`.
- Firebase Admin SDK for verifying Firebase ID tokens issued by the frontend.
- Drizzle ORM against Neon serverless PostgreSQL, via `@omnistack/core`.
- Stripe SDK for Checkout Sessions, the Customer Portal, and webhook handling.
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` for presigned avatar
  upload URLs.

## Requirements

Environment variables from the repository root `.env` (see root
`.env.example`):

- `DATABASE_URL`
- `FIREBASE_SERVICE_ACCOUNT`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Routes

A global `rateLimit` middleware (in-memory, per-Lambda-instance, best-effort)
applies to every route below before any auth check.

### `/api/user` — requires `Authorization: Bearer <Firebase ID token>`

| Method | Path                 | Description |
| ------ | -------------------- | ------------ |
| GET    | `/api/user/profile`  | Returns the authenticated user's row plus their `subscriptions` row (if any), 404 if the user doesn't exist. |
| POST   | `/api/user/sync`     | Upserts the authenticated user into Postgres using the Firebase UID as primary key (no-op if the row already exists). |
| PATCH  | `/api/user/profile`  | Updates `name` and/or `avatarUrl`; deletes the previous S3 avatar object when it changes. |

### `/api/uploads` — requires auth

| Method | Path                        | Description |
| ------ | --------------------------- | ------------ |
| POST   | `/api/uploads/profile-image` | Validates file type/extension/size (5 MB max, images only) and returns a presigned S3 `PUT` URL plus the resulting public URL. |

### `/api/stripe`

| Method | Path                  | Auth | Description |
| ------ | --------------------- | ---- | ------------ |
| POST   | `/api/stripe/checkout` | required | Creates a Stripe Checkout Session for a given `priceId`/`mode`, reusing the user's existing Stripe customer if present. |
| POST   | `/api/stripe/portal`   | required | Creates a Stripe Customer Portal session for the authenticated user's Stripe customer. |
| POST   | `/api/stripe/webhook`  | none (Stripe-signature-verified) | Verifies `stripe-signature` against `STRIPE_WEBHOOK_SECRET`, then synchronously upserts `subscriptions`/`orders` on `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. No SQS/queue — this must stay fast and idempotent since Stripe retries on failure or timeout. |

## Development

Run from the repository root, which starts this Lambda function together with
the frontend and a Stripe CLI webhook tunnel:

```bash
pnpm dev
```

This injects `DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `STRIPE_SECRET_KEY`,
and `STRIPE_WEBHOOK_SECRET` from your shell environment (loaded from the root
`.env`) via `sst dev`.

## Project structure

```
src/
  index.ts                Hono app entrypoint / Lambda handler; wires the
                           rate limiter and mounts /api/user, /api/uploads,
                           /api/stripe
  middleware/auth.ts        requireAuth: verifies Firebase ID tokens
  middleware/rateLimit.ts   In-memory fixed-window rate limiter
  routes/user.ts            /api/user/profile (GET/PATCH), /api/user/sync
  routes/uploads.ts         /api/uploads/profile-image
  routes/stripe.ts          /api/stripe/checkout, /portal, /webhook
  lib/firebase.ts           Firebase Admin SDK initialization
  lib/stripe.ts             Stripe SDK client initialization
  lib/response.ts           ok()/fail() — the shared ApiResponse<T> envelope
```

## Notes

- Keep this Lambda handler thin. The Stripe webhook is deliberately
  synchronous and in-Lambda (no queue/worker decoupling) per this project's
  $0-idle-cost architecture — DB writes and any Stripe API calls it makes must
  stay fast, idempotent (`onConflictDoUpdate` keyed on Stripe ids), and
  defensive.
- Database access should always go through `@omnistack/core` to keep types and
  schema in one place.
- The rate limiter is best-effort: its counters live in memory per Lambda
  instance, so they reset on cold start and aren't shared across concurrent
  instances. It's a soft guard against floods, not a hard guarantee.
