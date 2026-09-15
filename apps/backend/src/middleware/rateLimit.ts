import { createMiddleware } from "hono/factory";
import { fail } from "../lib/response";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

// Best-effort fixed-window counter held in memory per Lambda instance. It
// resets on cold start and isn't shared across concurrent instances, so this
// is a soft guard against request floods rather than a hard guarantee. A
// shared store (e.g. DynamoDB) would make it accurate across instances, but
// isn't needed for MVP-level protection and this needs zero extra AWS
// resources to stay within the $0-idle-cost constraint.
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = createMiddleware(async (c, next) => {
  const clientKey = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();

  const entry = requestCounts.get(clientKey);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
      return fail(c, "rate_limited", "Too many requests. Please try again later.", 429);
    }
  }

  await next();
});
