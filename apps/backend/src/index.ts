import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import userRouter from "./routes/user";
import uploadsRouter from "./routes/uploads";
import stripeRouter from "./routes/stripe";

const app = new Hono();

app.route("/api/user", userRouter);
app.route("/api/uploads", uploadsRouter);
app.route("/api/stripe", stripeRouter);

export const handler = handle(app);
