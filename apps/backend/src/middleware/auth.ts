import { createMiddleware } from "hono/factory";
import { firebaseAuth } from "../lib/firebase";

export type Env = {
    Variables: {
        userId: string;
        email: string;
    };
};

export const requireAuth = createMiddleware<Env>(async (c, next) => {
    
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);

        c.set("userId", decodedToken.uid);
        c.set("email", decodedToken.email || "");

        await next();
    } catch (error) {
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
});