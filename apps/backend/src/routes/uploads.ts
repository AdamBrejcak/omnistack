import { Hono } from "hono";
import { validator } from "hono/validator";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import { requireAuth, type Env } from "../middleware/auth";
import { ok, fail } from "../lib/response";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const s3 = new S3Client({});

const app = new Hono<Env>().post(
  "/profile-image",
  requireAuth,
  validator("json", (value, c) => {
    const { fileType, fileExtension, fileSize } = value as {
      fileType?: string;
      fileExtension?: string;
      fileSize?: number;
    };

    if (!fileType || !fileType.startsWith("image/")) {
      return fail(c, "invalid_file_type", "File must be an image.", 400);
    }

    if (!fileExtension) {
      return fail(c, "invalid_request", "Missing fileExtension.", 400);
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return fail(c, "file_too_large", "File size exceeds 5 MB limit.", 400);
    }

    return { fileType, fileExtension, fileSize };
  }),
  async (c) => {
    const { fileType, fileExtension } = c.req.valid("json");

    try {
      const fileKey = `avatars/${crypto.randomUUID()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: Resource.ProfileImages.name,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      const publicUrl = `https://${Resource.ProfileImages.name}.s3.amazonaws.com/${fileKey}`;

      return ok(c, { uploadUrl, publicUrl, fileKey });
    } catch (error) {
      console.error("Failed to create presigned upload URL:", error);
      return fail(c, "presign_failed", "Failed to create upload URL.", 500);
    }
  }
);

export default app;
