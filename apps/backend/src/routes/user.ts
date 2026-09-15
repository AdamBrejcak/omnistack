import { Hono } from "hono";
import { validator } from "hono/validator";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db, users, subscriptions } from "@omnistack/core/db";
import { eq } from "drizzle-orm";
import { Resource } from "sst";
import { requireAuth, type Env } from "../middleware/auth";
import { ok, fail } from "../lib/response";

const s3 = new S3Client({});

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

const app = new Hono<Env>()
  .get("/profile", requireAuth, async (c) => {
    const userId = c.get("userId");

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return fail(c, "user_not_found", "User not found", 404);
    }

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

    return ok(c, { user, subscription: subscription || null });
  })
  .post(
    "/sync",
    requireAuth,
    validator("json", (value, c) => {
      const { name } = value as { name?: string };
      return { name: typeof name === "string" ? name : undefined };
    }),
    async (c) => {
      const userId = c.get("userId");
      const email = c.get("email");
      const { name } = c.req.valid("json");

      try {
        let [user] = await db
          .insert(users)
          .values({
            id: userId,
            email: email,
            name: name || email.split("@")[0],
          })
          .onConflictDoNothing()
          .returning();

        if (!user) {
          user = (await db.query.users.findFirst({
            where: eq(users.id, userId),
          }))!;
        }

        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.userId, userId),
        });

        return ok(c, { user, subscription: subscription || null });
      } catch (error) {
        console.error("Failed to sync user:", error);
        return fail(c, "sync_failed", "Failed to sync user", 500);
      }
    }
  )
  .patch(
    "/profile",
    requireAuth,
    validator("json", (value, c) => {
      const { name, avatarUrl } = value as { name?: string; avatarUrl?: string };

      if (name === undefined && avatarUrl === undefined) {
        return fail(c, "invalid_request", "At least one field (name or avatarUrl) must be provided.", 400);
      }

      if (name !== undefined && (typeof name !== "string" || !name.trim())) {
        return fail(c, "invalid_request", "Invalid name parameter.", 400);
      }

      if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
        return fail(c, "invalid_request", "Invalid avatarUrl parameter.", 400);
      }

      return {
        name: name !== undefined ? name.trim() : undefined,
        avatarUrl,
      };
    }),
    async (c) => {
      const userId = c.get("userId");
      const { name, avatarUrl } = c.req.valid("json");

      const updateData: { name?: string; avatarUrl?: string } = {};
      if (name !== undefined) updateData.name = name;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      try {
        const currentUser = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!currentUser) {
          return fail(c, "user_not_found", "User not found", 404);
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

        return ok(c, { user: updatedUser, subscription: subscription || null });
      } catch (error) {
        console.error("Failed to update profile:", error);
        return fail(c, "update_failed", "Failed to update profile", 500);
      }
    }
  );

export default app;
