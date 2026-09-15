# @omnistack/core

Shared package: Drizzle ORM schema/client for the Neon PostgreSQL database, and
shared API response types — consumed by `apps/backend` (and any future
workers) via `@omnistack/core/db` and `@omnistack/core/api`.

## Exports

- `./db` — the Drizzle client (`db`), all table schemas, and their inferred
  row types (`User`, `Subscription`, `Order`), re-exported from
  `src/db/schema.ts`.
- `./api` — `ApiResponse<T>` (the `{ success, data, error }` envelope shared by
  every Hono endpoint) and `Serialized<T>`, a mapped type that turns `Date`
  fields into `string` to match what actually comes back over Hono RPC's JSON
  transport.

## Schema

Three tables, all in `src/db/schema.ts`:

- `users` — `id` (text, Firebase UID, primary key), `email`, `name`,
  `avatarUrl`, `createdAt`, `stripeCustomerId` (unique).
- `subscriptions` — `id` (Stripe subscription id), `userId` (FK → `users`,
  cascade), `stripeCustomerId`, `stripeSubscriptionId` (unique),
  `stripePriceId`, `status` (enum: `incomplete`, `incomplete_expired`,
  `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `paused`),
  `cancelAtPeriodEnd`, `currentPeriodStart`, `currentPeriodEnd`, timestamps.
- `orders` — `id` (Stripe Checkout session id), `userId` (FK → `users`,
  cascade), `stripePaymentIntentId` (unique), `stripeCheckoutSessionId`
  (unique), `amount` (cents), `currency`, `status`, `createdAt`. Used for
  one-time (`mode: "payment"`) Checkout sessions.

There is a single Pro tier today (`subscriptions.stripePriceId` /
`status` drive `isPro` on the frontend) — there's no separate plans/tiers
table.

## Requirements

- `DATABASE_URL` environment variable (Neon PostgreSQL connection string). See
  the root `.env.example`.

## Migrations

Migrations are managed with `drizzle-kit` and live in `packages/core/drizzle`.
Run these from the repository root:

```bash
# Generate a new migration from schema changes in src/db/schema.ts
pnpm db:generate

# Apply pending migrations to the configured DATABASE_URL (via `sst shell`)
pnpm db:push
```

`drizzle.config.ts` (repository root) points at `packages/core/src/db/schema.ts`
and outputs migrations to `packages/core/drizzle`.

## Project structure

```
src/
  db/
    index.ts     Drizzle client (neon-http driver) + schema re-export
    schema.ts    users / subscriptions / orders table definitions
  types/
    api.ts       ApiResponse<T>, Serialized<T>
drizzle/         Generated SQL migrations and metadata
```

## Notes

- Do not access Postgres directly from `apps/backend` route handlers; import
  `db` and table schemas from `@omnistack/core/db` to preserve a single source
  of truth for types across the API and any future consumers.
- Response payloads should be typed against `ApiResponse<T>` from
  `@omnistack/core/api` on both the backend (`ok()`/`fail()` in
  `apps/backend/src/lib/response.ts`) and the frontend (`unwrap()` in
  `apps/frontend/app/composables/useApi.ts`).
