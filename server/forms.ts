"use server";

import { formsTable } from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import { GetTextQuestionsData } from "./textQuestions";
import { GetChoicesData } from "./choices";
import { GetRatingQuestionsData } from "./ratings";
import { GetDateQuestionsData } from "./dates";
import { GetRankingQuestionsData } from "./rankingQuestions";
import { validateRequest } from "@/auth/validation";
import { db } from "@/db/database";

/**
 * Retrieves the name of a form by its ID for the authenticated user.
 * 
 * @param id - The form ID.
 * @returns The form name or an empty string if not found or unauthorized.
 */
export async function GetFormName(id: string): Promise<string> {
    const session = await validateRequest();
    if (session.session == null) {
        return "";
    }
    const user = session.user;
    const user_id = user.id;
    const [ formData ] = await db.select().from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    ))
    if (formData == undefined) {
        // Invalid id or invalid credentials
        return "";
    }
    const output = formData as { id: string, name: string, user_id: string };
    return output.name;
}

/**
 * Retrieves all questions related to a form for the authenticated user.
 * 
 * @param id - The form ID.
 * @returns An object containing the form name and questions or null if unauthorized.
 */
export async function GetFormData(id: string) {
    const session = await validateRequest();
    if (session.session == null) {
        return null;
    }
    const user = session.user;
    const user_id = user.id;
    
    const output = [];
    const [ choicesDataOutput, textQuestionsOutput, ratingQuestionsOutput, dateQuestionsOutput, rankingQuestionsOutput ] = await Promise.all([
        GetChoicesData(id, user_id),
        GetTextQuestionsData(id, user_id),
        GetRatingQuestionsData(id, user_id),
        GetDateQuestionsData(id, user_id),
        GetRankingQuestionsData(id, user_id)
    ]);
    const { output: choicesOutput, formName } = choicesDataOutput;
    output.push(...choicesOutput);
    output.push(...textQuestionsOutput);
    output.push(...ratingQuestionsOutput);
    output.push(...dateQuestionsOutput);
    output.push(...rankingQuestionsOutput);
    return {
        formName: formName,
        questions: output
    };
}

/**
 * Creates a new form for the authenticated user and returns the form ID.
 * 
 * @param name - The name of the new form.
 * @returns The ID of the newly created form or null if unauthorized.
 */
export async function CreateNewForm(name: string): Promise<string | null> {
    const session = await validateRequest();
    if (session.session == null) {
        return null;
    }
    const user = session.user;
    const user_id = user.id;

    const response = await db.insert(formsTable).values({
        name: name,
        user_id: user_id
    }).returning();
    const formID = response[0].id;
    return formID;
}

/**
 * Retrieves all forms associated with the authenticated user.
 * 
 * @returns An array of objects each containing the form ID and name.
 */
export async function GetForms() {
    const session = await validateRequest();
    if (session.session == null) {
        return [];
    }
    const user = session.user;
    const user_id = user.id;

    const response = await db.select().from(formsTable).where(eq(formsTable.user_id, user_id));
    return response.map((current) => {
        return {
            id: current.id,
            name: current.name
        }
    });
}

/**
 * Updates the title of a specific form for the authenticated user.
 * 
 * @param formID - The ID of the form to update.
 * @param formTitle - The new title for the form.
 * @returns true if the update was successful, false otherwise.
 */
export async function UpdateFormTitle(formID: string, formTitle: string) {
    const session = await validateRequest();
    if (session.session == null) {
        return [];
    }
    const user = session.user;
    const user_id = user.id;

    const response = await db.update(formsTable).set({
        name: formTitle
    }).where(and(eq(formsTable.user_id, user_id), eq(formsTable.id, formID)));
    if (response.rowCount == 1) {
        return true;
    }
    return false;
}

/**
 * Deletes a form from the database if it belongs to the current user.
 *
 * @param formID - The unique identifier of the form to be deleted.
 * @returns A promise that resolves to `true` if the form was successfully deleted,
 *          `false` if no form was deleted, or an empty array if the user session is not defined.
 */
export async function DeleteForm(formID: string): Promise<boolean | []> {
    const session = await validateRequest();
    if (session.session == null) {
        return [];
    }
    const user = session.user;
    const user_id = user.id;

    const response = await db.delete(formsTable).where(and(eq(formsTable.user_id, user_id), eq(formsTable.id, formID)));
    if (response.rowCount == 1) {
        return true;
    }
    return false;
}