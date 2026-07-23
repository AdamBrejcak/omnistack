import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import userRouter from "./routes/user";
import { cors } from "hono/cors";

const app = new Hono();
// app.use("*", cors());

app.route("/api/user", userRouter);

export const handler = handle(app);
