import { Hono } from "hono";
import { db, users } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import { Env, requireAuth } from "../middleware/auth";

const userRouter = new Hono<Env>();

userRouter.get("/me", requireAuth, async (c) => {
  const userId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user });
});

userRouter.post("/sync", requireAuth, async (c) => {
  const userId = c.get("userId");
  const email = c.get("email");
  const { name } = await c.req.json();

  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      email: email,
      name: name || email.split("@")[0],
    })
    .onConflictDoNothing()
    .returning();

  return c.json({ status: "synced", user });
});

export default userRouter;