"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { question, RankingData, RankOptionData } from "./types";
import { CredentialsValid } from "./auth";
import { formsTable, rankingOptionsTable, rankingQuestionTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateRequest } from "@/auth/validation";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

/**
 * Creates a new ranking question for a specified form.
 *
 * @param formID - The ID of the form to which the ranking question will be added.
 * @param question - The text of the ranking question.
 * @param rankingOptions - An array of options for the ranking question.
 * @param orderIndex - The order index at which the question should appear.
 * @returns A promise that resolves to the created RankingData object or null if creation fails.
 */
export async function CreateNewRankingQuestion(formID: string, question: string, rankingOptions: string[], orderIndex: number): Promise<null | RankingData> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(rankingQuestionTable).values({
        question: question,
        form_id: formID,
        orderIndex: orderIndex
    }).returning();
    if (response.length == 0) {
        console.error("Failed to insert ranking question!");
        return null;
    }

    const optionsList: RankOptionData[] = [];

    for (let i = 0; i < rankingOptions.length; i++) {
        const response2 = await db.insert(rankingOptionsTable).values({
            option: rankingOptions[i],
            ranking_id: response[0].ranking_question_id,
            orderIndex: i
        }).returning();
        if (response2.length == 0) {
            console.error("Failed to insert ranking option!");
            return null;
        }
        optionsList.push({
            id: response2[0].ranking_option_id,
            option: response2[0].option ?? "",
            order_index: response2[0].orderIndex
        });
    }
    return {
        id: response[0].ranking_question_id,
        questionText: response[0].question ?? "",
        rankOptions: optionsList,
        order_index: response[0].orderIndex,
        required: response[0].required
    }
}

/**
 * Deletes a ranking question by its ID after verifying user credentials.
 *
 * @param questionID - The ID of the ranking question to delete.
 * @returns A promise that resolves to true if the question is deleted, otherwise false.
 */
export async function DeleteRankingQuestion(questionID: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [ authData ] = await db.select().from(formsTable).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, formsTable.id)).where(and(eq(rankingQuestionTable.ranking_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(rankingQuestionTable).where(eq(rankingQuestionTable.ranking_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Updates a ranking question's text, options, and order index after verifying user credentials.
 *
 * @param questionID - The ID of the question to update.
 * @param questionText - The new text for the ranking question.
 * @param rankingOptions - An array of RankOptionData objects for the updated options.
 * @param order_index - The new order index for the ranking question.
 * @returns A promise that resolves to true if the update is successful, otherwise false.
 */
export async function UpdateRankingQuestion(questionID: number, questionText: string, rankingOptions: RankOptionData[], order_index: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [ authData ] = await db.select().from(formsTable).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, formsTable.id)).where(and(eq(rankingQuestionTable.ranking_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    
    const response = await db.update(rankingQuestionTable).set({
        question: questionText,
        orderIndex: order_index
    }).where(eq(rankingQuestionTable.ranking_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    const optionsResponses = await Promise.all(rankingOptions.map((current) => {
        return db.update(rankingOptionsTable).set({
            option: current.option,
            orderIndex: current.order_index
        }).where(eq(rankingOptionsTable.ranking_option_id, current.id));
    }));
    return optionsResponses.every((current) => current.rowCount != 0);
}

/**
 * Updates the order index of a ranking question after verifying user credentials.
 *
 * @param questionID - The ID of the ranking question to update.
 * @param order_index - The new order index for the question.
 * @returns A promise that resolves to true if the update is successful, otherwise false.
 */
export async function UpdateRankingQuestionOrderIndex(questionID: number, order_index: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [ authData ] = await db.select().from(formsTable).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, formsTable.id)).where(and(eq(rankingQuestionTable.ranking_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(rankingQuestionTable).set({
        orderIndex: order_index
    }).where(eq(rankingQuestionTable.ranking_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

/**
 * Retrieves all ranking questions for a given form ID if the form belongs to the specified user.
 *
 * @param id - The ID of the form to retrieve questions for.
 * @param user_id - The ID of the user owning the form.
 * @returns A promise resolving to an array of questions if found, otherwise an empty array.
 */
export async function GetRankingQuestionsData(id: string, user_id: string): Promise<question[]> {
    const formData = await db.select({
        ranking_question_id: rankingQuestionTable.ranking_question_id,
        ranking_question: rankingQuestionTable.question,
        ranking_order_index: rankingQuestionTable.orderIndex,
        ranking_option_id: rankingOptionsTable.ranking_option_id,
        ranking_option: rankingOptionsTable.option,
        ranking_option_order_index: rankingOptionsTable.orderIndex,
        ranking_question_required: rankingQuestionTable.required,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, id)).leftJoin(rankingOptionsTable, eq(rankingOptionsTable.ranking_id, rankingQuestionTable.ranking_question_id));
    if (formData.length == 0) {
        return [];
    }
    const output = RankingDataProcess(formData);
    return output;
}

/**
 * Processes raw form data into a structured array of ranking questions.
 *
 * @param formData - The raw form data array.
 * @returns An array of formatted question objects.
 */
function RankingDataProcess(formData: { ranking_question_id: number | null; ranking_question: string | null; ranking_order_index: number | null; ranking_option_id: number | null; ranking_option: string | null; ranking_option_order_index: number | null; ranking_question_required: boolean | null; }[]): question[] {
    const rankingQuestions: RankingData[] = [];
    formData.forEach(element => {
        let optionsList: RankOptionData[] = [];
        let itemIndex = -1;
        rankingQuestions.forEach((item, index) => {
            if (item.id == element.ranking_question_id) {
                itemIndex = index;
                optionsList = item.rankOptions;
            }
        });
        if (itemIndex != -1) {
            optionsList.push({
                id: element.ranking_option_id ?? -1,
                option: element.ranking_option ?? "",
                order_index: element.ranking_option_order_index ?? -1
            });
            rankingQuestions[itemIndex] = {
                id: element.ranking_question_id ?? 0,
                questionText: element.ranking_question ?? "",
                rankOptions: optionsList,
                order_index: element.ranking_order_index ?? -1,
                required: element.ranking_question_required ?? false,
            };
        } else {
            if (element.ranking_option != null) {
                optionsList.push({
                    id: element.ranking_option_id ?? -1,
                    option: element.ranking_option ?? "",
                    order_index: element.ranking_option_order_index ?? -1,
                });
            }
            if (element.ranking_question_id != null) {
                rankingQuestions.push({
                    id: element.ranking_question_id,
                    questionText: element.ranking_question ?? "",
                    rankOptions: optionsList,
                    order_index: element.ranking_order_index ?? -1,
                    required: element.ranking_question_required ?? false,
                });
            }
        }
    });
    const output: question[] = rankingQuestions.map((current) => {
        return {
            type: "Ranking",
            data: current
        }
    });
    return output;
}

/**
 * Creates a new ranking option for a specified ranking question.
 *
 * @param questionID - The ID of the ranking question to which the option will be added.
 * @param option - The text of the ranking option.
 * @param order_index - The order index of the new option.
 * @returns A promise that resolves to the created RankOptionData object or null if creation fails.
 */
export async function CreateNewRankingOption(questionID: number, option: string, order_index: number): Promise<RankOptionData | null> {
    const session = await validateRequest();
    if (session.session == null) {
        return null;
    }
    const user = session.user;
    const user_id = user.id;

    const [authData] = await db.select().from(formsTable).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        return null;
    }

    const response = await db.insert(rankingOptionsTable).values({
        option: option,
        ranking_id: questionID,
        orderIndex: order_index
    }).returning();
    if (response.length == 0) {
        return null;
    }
    return {
        id: response[0].ranking_option_id,
        option: response[0].option ?? "",
        order_index: response[0].orderIndex
    }
}

/**
 * Deletes a ranking option by its ID after verifying user credentials.
 *
 * @param option_id - The ID of the ranking option to delete.
 * @returns A promise that resolves to true if the option is deleted, otherwise false.
 */
export async function DeleteRankingOption(option_id: number): Promise<boolean> {
    const session = await validateRequest();
    if (session.session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.id;

    const [authData] = await db.select().from(formsTable).leftJoin(rankingQuestionTable, eq(rankingQuestionTable.form_id, formsTable.id)).leftJoin(rankingOptionsTable, eq(rankingOptionsTable.ranking_id, rankingQuestionTable.ranking_question_id)).where(and(eq(formsTable.user_id, user_id), eq(rankingOptionsTable.ranking_option_id, option_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(rankingOptionsTable).where(eq(rankingOptionsTable.ranking_option_id, option_id));
    return response.rowCount == 1;
}