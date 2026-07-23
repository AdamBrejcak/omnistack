import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Securely fetch the connection string from SST Resource Store
const sql = neon(process.env.DATABASE_URL!);

// Initialize the Drizzle ORM client with our schema
export const db = drizzle(sql, { schema });
export * from "./schema";