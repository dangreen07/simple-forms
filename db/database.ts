import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http/driver";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

// Initialize the database connection
const neon_connection = neon(DATABASE_URL);
export const db = drizzle(neon_connection);