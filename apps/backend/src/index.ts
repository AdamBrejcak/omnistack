import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import userRouter from "./routes/user";
import uploadsRouter from "./routes/uploads";
import stripeRouter from "./routes/stripe";

const app = new Hono();

const routes = app
  .route("/api/user", userRouter)
  .route("/api/uploads", uploadsRouter)
  .route("/api/stripe", stripeRouter);

export type AppType = typeof routes;

export const handler = handle(app);
