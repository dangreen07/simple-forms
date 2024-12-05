"use server";

import { formsTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from 'drizzle-orm';
import { validateRequest } from "@/auth/validation";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

export async function CredentialsValid(formID: string) {
    const session = await validateRequest();
    if (session.session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user?.id ?? "";

    const [ formData ] = await db.select().from(formsTable).where(and(
        eq(formsTable.id, formID),
        eq(formsTable.user_id, user_id)
    ))
    if (formData == undefined) {
        // Invalid id or invalid credentials
        return false;
    }
    return true;
}