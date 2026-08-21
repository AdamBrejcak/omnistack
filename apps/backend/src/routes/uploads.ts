import { Hono } from "hono";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import { Env, requireAuth } from "../middleware/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const s3 = new S3Client({});
const uploadsRouter = new Hono<Env>();

uploadsRouter.post("/profile-image", requireAuth, async (c) => {
  const { fileType, fileExtension, fileSize } = await c.req.json<{
    fileType: string;
    fileExtension: string;
    fileSize?: number;
  }>();

  if (!fileType || !fileType.startsWith("image/")) {
    return c.json({ error: "File must be an image." }, 400);
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return c.json({ error: "File size exceeds 5 MB limit." }, 400);
  }

  const fileKey = `avatars/${crypto.randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: Resource.ProfileImages.name,
    Key: fileKey,
    ContentType: fileType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `https://${Resource.ProfileImages.name}.s3.amazonaws.com/${fileKey}`;

  return c.json({
    uploadUrl,
    publicUrl,
    fileKey,
  });
});

export default uploadsRouter;