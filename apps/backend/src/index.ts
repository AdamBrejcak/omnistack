import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import userRouter from "./routes/user";

const app = new Hono();

app.route("/api/user", userRouter);

export const handler = handle(app);
