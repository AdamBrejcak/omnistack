import { Hono } from "hono";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db, users } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import { Resource } from "sst";
import { Env, requireAuth } from "../middleware/auth";

const s3 = new S3Client({});
const userRouter = new Hono<Env>();

async function deleteOldAvatarIfExists(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return;
  try {
    const url = new URL(avatarUrl);
    const key = url.pathname.substring(1);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: Resource.ProfileImages.name,
        Key: key,
      })
    );
  } catch (err) {
    console.error("Failed to delete old avatar from S3:", err);
  }
}

userRouter.get("/profile", requireAuth, async (c) => {
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

userRouter.patch("/profile", requireAuth, async (c) => {
  const userId = c.get("userId");
  const { avatarUrl } = await c.req.json<{ avatarUrl?: string }>();

  if (!avatarUrl || typeof avatarUrl !== "string") {
    return c.json({ error: "Invalid or missing avatarUrl parameter." }, 400);
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const [updatedUser] = await db
    .update(users)
    .set({ avatarUrl })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    return c.json({ error: "User not found" }, 404);
  }

  if (currentUser?.avatarUrl && currentUser.avatarUrl !== avatarUrl) {
    await deleteOldAvatarIfExists(currentUser.avatarUrl);
  }

  return c.json({
    status: "updated",
    user: updatedUser,
  });
});

export default userRouter;