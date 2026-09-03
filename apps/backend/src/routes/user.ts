import { Hono } from "hono";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db, users, subscriptions } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import { Resource } from "sst";
import { Env, requireAuth } from "../middleware/auth";

const s3 = new S3Client({});
const app = new Hono<Env>();

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

app.get("/profile", requireAuth, async (c) => {
  const userId = c.get("userId");

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  return c.json({
    user,
    subscription: subscription || null,
  });
});

app.post("/sync", requireAuth, async (c) => {
  const userId = c.get("userId");
  const email = c.get("email");
  const { name } = await c.req.json();

  let [user] = await db
    .insert(users)
    .values({
      id: userId,
      email: email,
      name: name || email.split("@")[0],
    })
    .onConflictDoNothing()
    .returning();

  // If user already existed, onConflictDoNothing returns empty array -> fetch user
  if (!user) {
    user = (await db.query.users.findFirst({
      where: eq(users.id, userId),
    }))!;
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  return c.json({
    status: "synced",
    user,
    subscription: subscription || null,
  });
});

app.patch("/profile", requireAuth, async (c) => {
  const userId = c.get("userId");
  const { name, avatarUrl } = await c.req.json<{
    name?: string;
    avatarUrl?: string;
  }>();

  if (!name && !avatarUrl) {
    return c.json({ error: "At least one field (name or avatarUrl) must be provided." }, 400);
  }

  const updateData: { name?: string; avatarUrl?: string } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return c.json({ error: "Invalid name parameter." }, 400);
    }
    updateData.name = name.trim();
  }

  if (avatarUrl !== undefined) {
    if (typeof avatarUrl !== "string") {
      return c.json({ error: "Invalid avatarUrl parameter." }, 400);
    }
    updateData.avatarUrl = avatarUrl;
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!currentUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  if (
    avatarUrl !== undefined &&
    currentUser.avatarUrl &&
    currentUser.avatarUrl !== avatarUrl
  ) {
    await deleteOldAvatarIfExists(currentUser.avatarUrl);
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  return c.json({
    status: "updated",
    user: updatedUser,
    subscription: subscription || null,
  });
});

export default app;