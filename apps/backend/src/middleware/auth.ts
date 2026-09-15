import { createMiddleware } from "hono/factory";
import { firebaseAuth } from "../lib/firebase";
import { fail } from "../lib/response";

export type Env = {
  Variables: {
    userId: string;
    email: string;
  };
};

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return fail(c, "unauthorized", "Missing or invalid Authorization header", 401);
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    c.set("userId", decodedToken.uid);
    c.set("email", decodedToken.email || "");

    await next();
  } catch (error) {
    console.error("Failed to verify Firebase ID token:", error);
    return fail(c, "unauthorized", "Invalid or expired token", 401);
  }
});