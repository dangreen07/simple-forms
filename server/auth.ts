"use server";

import { formsTable } from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import { validateRequest } from "@/auth/validation";
import { db } from "@/db/database";

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