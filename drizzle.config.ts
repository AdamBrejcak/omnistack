import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/core/src/db/schema.ts",
  out: "./packages/core/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL!,
  },
});