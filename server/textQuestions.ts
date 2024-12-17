"use server";

import { CredentialsValid } from "./auth";
import { choicesTable, formsTable, textQuestionsTable } from "@/db/schema";
import { question, TextData } from "./types";
import { eq, and } from "drizzle-orm";
import { validateRequest } from "@/auth/validation";
import { db } from "@/db/database";

/**
 * Creates a new text question for a specified form.
 *
 * Validates credentials for the specified form and, if valid,
 * inserts a new text question into the database and returns
 * the text data if successful.
 *
 * @param {string} formID - The ID of the form to which the text question belongs.
 * @param {string} question - The text of the question.
 * @param {number} orderIndex - The order index for the question within the form.
 * @returns {Promise<null | TextData>} - A promise that resolves to the newly created
 * text question data if successful, or null if not.
 */
export async function CreateNewTextQuestion(formID: string, question: string, orderIndex: number): Promise<null | TextData> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(textQuestionsTable).values({
        question: question,
        form_id: formID,
        textOrderIndex: orderIndex
    }).returning();

    if (response.length == 0) {
        console.error("Failed to insert text question!");
        return null;
    }

    return {
        id: response[0].text_question_id,
        questionText: response[0].question ?? "",
        order_index: response[0].textOrderIndex,
        required: response[0].required,
        editable: response[0].editable
    }
}

/**
 * Updates a text question's details if the user is authorized.
 *
 * @param {number} questionID - The ID of the question to update.
 * @param {string} questionText - The new text for the question.
 * @param {number} order_index - The new order index for the question.
 * @returns {Promise<boolean>} - A promise that resolves to true if the update is successful.
 */
export async function UpdateTextQuestion(questionID: number, questionText: string, order_index: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;
    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        return false;
    }

    const response = await db.update(textQuestionsTable).set({
        question: questionText,
        textOrderIndex: order_index
    }).where(eq(textQuestionsTable.text_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Deletes a text question if the user is authorized.
 *
 * @param {number} questionID - The ID of the question to delete.
 * @returns {Promise<boolean>} - A promise that resolves to true if the question is successfully deleted.
 */
export async function DeleteTextQuestion(questionID: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [authData] = await db.select().from(formsTable).leftJoin(textQuestionsTable, eq(textQuestionsTable.form_id, formsTable.id)).where(and(eq(textQuestionsTable.text_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(textQuestionsTable).where(eq(textQuestionsTable.text_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Updates the order index of a text question if the user is authorized.
 *
 * @param {number} questionID - The ID of the question to update.
 * @param {number} order_index - The new order index for the question.
 * @returns {Promise<boolean>} - A promise that resolves to true if the update is successful.
 */
export async function UpdateTextQuestionOrderIndex(questionID: number, order_index: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [authData] = await db.select().from(formsTable).leftJoin(textQuestionsTable, eq(textQuestionsTable.form_id, formsTable.id)).where(and(eq(textQuestionsTable.text_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(textQuestionsTable).set({
        textOrderIndex: order_index
    }).where(eq(textQuestionsTable.text_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Retrieves text question data for a specific form and user.
 *
 * @param {string} id - The ID of the form.
 * @param {string} user_id - The ID of the user.
 * @returns {Promise<question[]>} - A promise that resolves to an array of text questions data.
 */
export async function GetTextQuestionsData(id: string, user_id: string): Promise<question[]> {
    const formData = await db.select({
        text_id: textQuestionsTable.text_question_id,
        question: textQuestionsTable.question,
        order_index: textQuestionsTable.textOrderIndex,
        text_question_required: textQuestionsTable.required,
        text_editable: textQuestionsTable.editable,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(textQuestionsTable, eq(textQuestionsTable.form_id, formsTable.id));
    if (formData.length == 0) {
        return [];
    }
    const output = TextDataProcess(formData);
    return output;
}

/**
 * Processes raw form data into a structured array of text questions.
 *
 * @param {Array} formData - The raw form data array.
 * @returns {question[]} - An array of formatted question objects.
 */
function TextDataProcess(formData: {
    text_id: number | null;
    question: string | null;
    order_index: number | null;
    text_question_required: boolean | null;
    text_editable: boolean | null;
}[]): question[] {
    return formData.filter((current) => current.text_id != null).map((element) => {
        return {
            type: 'Text',
            data: {
                id: element.text_id ?? -1,
                questionText: element.question ?? "",
                order_index: element.order_index ?? -1,
                required: element.text_question_required ?? false,
                editable: element.text_editable ?? false
            }
        }
    })
}