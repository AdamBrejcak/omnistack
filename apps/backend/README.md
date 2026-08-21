# @omnistack/backend

Hono API deployed as a single AWS Lambda function via SST, using an AWS Lambda Function URL.

## Stack

- [Hono](https://hono.dev/) HTTP framework, running via `hono/aws-lambda`.
- Firebase Admin SDK for verifying Firebase ID tokens issued by the frontend.
- Drizzle ORM against Neon serverless PostgreSQL, via `@omnistack/core`.

## Requirements

- Environment variables from the repository root `.env` (see root `.env.example`):
  - `DATABASE_URL`
  - `FIREBASE_SERVICE_ACCOUNT`

## Routes

All routes are mounted under `/api/user` and require a valid Firebase ID token
(`Authorization: Bearer <token>`), enforced by `requireAuth` middleware.

| Method | Path             | Description                                                        |
| ------ | ---------------- | ------------------------------------------------------------------- |
| GET    | `/api/user/profile`   | Returns the authenticated user's row from Postgres, 404 if missing.|
| POST   | `/api/user/sync` | Inserts the authenticated user into Postgres on first sign-up (uses Firebase UID as primary key; no-op if the row already exists). |

## Development

Run from the repository root, which starts this Lambda function together with
the frontend:

```bash
pnpm sst dev
```

This injects `DATABASE_URL` / `FIREBASE_SERVICE_ACCOUNT` from your shell
environment (loaded from the root `.env`).

## Project structure

```
src/
  index.ts              Hono app entrypoint / Lambda handler
  middleware/auth.ts     requireAuth: verifies Firebase ID tokens
  routes/user.ts         /api/user/profile and /api/user/sync
  lib/firebase.ts         Firebase Admin SDK initialization
```

## Notes

- Keep this Lambda handler thin. Long-running, asynchronous, or webhook-style
  processing should be delegated to a queue-backed worker when that
  infrastructure exists.
- Database access should always go through `@omnistack/core` to keep types and
  schema in one place.
