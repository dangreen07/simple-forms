"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { question, RatingData } from "./types";
import { CredentialsValid } from "./auth";
import { formsTable, ratingQuestionTable } from "@/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq, and } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

/**
 * Creates a new rating question for a specified form.
 *
 * This function first validates the credentials for the specified form.
 * If valid, it inserts a new rating question into the database with a
 * default rating level of 5. The function then returns the rating data
 * if the insertion was successful.
 *
 * @param {number} formID - The ID of the form to which the rating question belongs.
 * @param {string} question - The text of the rating question.
 * @param {number} orderIndex - The order index for the question in the form.
 * @returns {Promise<null | RatingData>} - A promise that resolves to the newly created
 * rating question data if successful, or null if not.
 */
export async function CreateNewRatingQuestion(formID: number, question: string, orderIndex: number): Promise<null | RatingData> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(ratingQuestionTable).values({
        question: question,
        form_id: formID,
        ratingLevels: 5,
        orderIndex: orderIndex
    }).returning();

    if (response.length == 0) {
        // Failed to insert rating question
        console.error("Failed to insert rating question!");
        return null;
    }

    return {
        id: response[0].rating_question_id,
        questionText: response[0].question ?? "",
        ratingsLevel: response[0].ratingLevels,
        order_index: response[0].orderIndex
    }
}

/**
 * Deletes a rating question from the database if the user is authorized.
 *
 * This function checks if the current session is valid and whether the 
 * user is authorized to delete the specified rating question. It then 
 * attempts to delete the question and returns a boolean indicating 
 * success or failure.
 *
 * @param {number} questionID - The ID of the rating question to delete.
 * @returns {Promise<boolean>} - A promise that resolves to true if the 
 * question was successfully deleted, or false otherwise.
 */
export async function DeleteRatingQuestion(questionID: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(ratingQuestionTable, eq(ratingQuestionTable.form_id, formsTable.id)).where(and(eq(ratingQuestionTable.rating_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(ratingQuestionTable).where(eq(ratingQuestionTable.rating_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function UpdateRatingQuestion(questionID: number, questionText: string, ratingsLevel: number, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;
    const [ authData ] = await db.select().from(formsTable).leftJoin(ratingQuestionTable, eq(ratingQuestionTable.form_id, formsTable.id)).where(and(eq(ratingQuestionTable.rating_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    
    const response = await db.update(ratingQuestionTable).set({
        question: questionText,
        ratingLevels: ratingsLevel,
        orderIndex: order_index
    }).where(eq(ratingQuestionTable.rating_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function UpdateRatingQuestionOrderIndex(questionID: number, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(ratingQuestionTable, eq(ratingQuestionTable.form_id, formsTable.id)).where(and(eq(ratingQuestionTable.rating_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(ratingQuestionTable).set({
        orderIndex: order_index
    }).where(eq(ratingQuestionTable.rating_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function GetRatingQuestionsData(id: number, user_id: string) {
    const formData = await db.select({
        rating_question_id: ratingQuestionTable.rating_question_id,
        rating_question: ratingQuestionTable.question,
        rating_level: ratingQuestionTable.ratingLevels,
        order_index: ratingQuestionTable.orderIndex,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(ratingQuestionTable, eq(ratingQuestionTable.form_id, formsTable.id));

    if (formData.length == 0) {
        return [];
    }
    const output = RatingDataProcess(formData);
    return output;
}

function RatingDataProcess(formData: {
    rating_question_id: number | null;
    rating_question: string | null;
    rating_level: number | null;
    order_index: number | null;
}[]) {
    const ratings: question[] = formData.filter((current) => current.rating_question_id != null).map((element) => {
        return {
            type: "Rating",
            data: {
                id: element.rating_question_id ?? -1,
                questionText: element.rating_question ?? "",
                ratingsLevel: element.rating_level ?? -1,
                order_index: element.order_index ?? -1
            }
        }
    })
    return ratings;
}