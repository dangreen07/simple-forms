"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { question, DateData } from "./types";
import { CredentialsValid } from "./auth";
import { formsTable, dateQuestionTable } from "@/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq, and } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

/**
 * Creates a new date question for a specified form.
 *
 * @param formID - The ID of the form to which the date question will be added.
 * @param question - The text of the date question.
 * @param orderIndex - The order index at which the question should appear.
 * @returns A promise that resolves to the created DateData object or null if creation fails.
 */
export async function CreateNewDateQuestion(formID: number, question: string, orderIndex: number): Promise<null | DateData> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(dateQuestionTable).values({
        question: question,
        form_id: formID,
        orderIndex: orderIndex
    }).returning();

    if (response.length == 0) {
        console.error("Failed to insert date question!");
        return null;
    }

    return {
        id: response[0].date_question_id,
        questionText: response[0].question ?? "",
        order_index: response[0].orderIndex,
        required: response[0].required
    }
}

/**
 * Deletes a date question by its ID after verifying user credentials.
 *
 * @param questionID - The ID of the date question to delete.
 * @returns A promise that resolves to true if the question is deleted, otherwise false.
 */
export async function DeleteDateQuestion(questionID: number): Promise<boolean> {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(dateQuestionTable).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Updates a date question's text and order index after verifying user credentials.
 *
 * @param questionID - The ID of the question to update.
 * @param questionText - The new text for the date question.
 * @param order_index - The new order index for the date question.
 * @returns A promise that resolves to true if the update is successful, otherwise false.
 */
export async function UpdateDateQuestion(questionID: number, questionText: string, order_index: number): Promise<boolean> {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;
    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    
    const response = await db.update(dateQuestionTable).set({
        question: questionText,
        orderIndex: order_index
    }).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Updates the order index of a date question after verifying user credentials.
 *
 * @param questionID - The ID of the date question to update.
 * @param order_index - The new order index for the question.
 * @returns A promise that resolves to true if the update is successful, otherwise false.
 */
export async function UpdateDateQuestionOrderIndex(questionID: number, order_index: number): Promise<boolean> {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(dateQuestionTable).set({
        orderIndex: order_index
    }).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Retrieves all date questions for a given form ID if the form belongs to the specified user.
 *
 * @param id - The ID of the form to retrieve questions for.
 * @param user_id - The ID of the user owning the form.
 * @returns A promise resolving to an array of questions if found, otherwise an empty array.
 */
export async function GetDateQuestionsData(id: number, user_id: string): Promise<question[]> {
    const formData = await db.select({
        date_question_id: dateQuestionTable.date_question_id,
        question: dateQuestionTable.question,
        order_index: dateQuestionTable.orderIndex,
        date_question_required: dateQuestionTable.required,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id));

    if (formData.length == 0) {
        return [];
    }
    const output = DateDataProcess(formData);
    return output;
}

/**
 * Processes raw form data into a structured array of date questions.
 *
 * @param formData - The raw form data array.
 * @returns An array of formatted question objects.
 */
function DateDataProcess(formData: {
    date_question_id: number | null;
    question: string | null;
    order_index: number | null;
    date_question_required: boolean | null;
}[]): question[] {
    return formData.filter((current) => current.date_question_id != null).map((element) => {
        return {
            type: "Date",
            data: {
                id: element.date_question_id ?? -1,
                questionText: element.question ?? "",
                order_index: element.order_index ?? -1,
                required: element.date_question_required ?? false
            }
        }
    })
}