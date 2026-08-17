# @omnistack/core

Shared database package: Drizzle ORM schema and client for the Neon PostgreSQL database,
consumed by `apps/backend` (and any future workers) via `@omnistack/core/db`.

## Exports

- `./db` — exports the Drizzle client (`db`) and the schema (tables), re-exported from
  `src/db/schema.ts`.

## Schema

Currently defines a single table:

- `users` — `id` (text, Firebase UID, primary key), `name`, `email` (unique),
  `createdAt`.

## Requirements

- `DATABASE_URL` environment variable (Neon PostgreSQL connection string). See the
  root `.env.example`.

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
src/db/
  index.ts     Drizzle client (neon-http driver) + schema re-export
  schema.ts    Table definitions
drizzle/       Generated SQL migrations and metadata
```

## Notes

- Do not access Postgres directly from `apps/backend` route handlers; import
  `db` and table schemas from `@omnistack/core/db` to preserve a single source
  of truth for types across the API and any future consumers.
