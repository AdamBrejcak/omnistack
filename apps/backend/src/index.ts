import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import userRouter from "./routes/user";
import uploadsRouter from "./routes/uploads";

const app = new Hono();

app.route("/api/user", userRouter);
app.route("/api/uploads", uploadsRouter);

export const handler = handle(app);
