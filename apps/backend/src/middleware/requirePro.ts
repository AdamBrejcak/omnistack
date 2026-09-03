import { createMiddleware } from "hono/factory";
import { db, subscriptions } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import { Env } from "./auth";

export const requirePro = createMiddleware<Env>(async (c, next) => {
  const userId = c.get("userId");

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  const isActive =
    sub &&
    (sub.status === "active" || sub.status === "trialing" || new Date(sub.currentPeriodEnd) > new Date());

  if (!isActive) {
    return c.json({ error: "Pro subscription required" }, 403);
  }

  await next();
});