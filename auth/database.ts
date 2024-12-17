import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http/driver";

const sql = neon(process.env.DATABASE_URL!);
export const auth_db = drizzle(sql);