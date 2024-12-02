"use server";

import { choicesOptionsTable, choicesTable, formsTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { CredentialsValid } from "./auth";
import { eq, and } from "drizzle-orm";
import { ChoiceData, OptionsData, question } from "./types";
import { getSession } from "@auth0/nextjs-auth0";

// Setup the database connection
const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the environment variables file!");
}

const db = drizzle(DATABASE_URL);

/**
 * Creates a new choice question with its options in the database.
 * 
 * @param formID - ID of the form to which the choice belongs.
 * @param questionText - Text of the choice question.
 * @param options - Array of option strings for the choice question.
 * @param order_index - Order index for the question.
 * @returns A promise that resolves to the newly created choice question data or null if credentials are invalid.
 */
export async function CreateNewChoicesQuestion(formID: string, questionText: string, options: string[], order_index: number): Promise<ChoiceData | null> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(choicesTable).values({
        question: questionText,
        form_id: formID,
        choicesOrderIndex: order_index
    }).returning();
    if (response.length == 0) {
        console.error("Failed to insert choice question!");
        return null;
    }

    const optionsResponse = await db.insert(choicesOptionsTable).values(options.map((current) => {
        return {
            choices_id: response[0].choices_id,
            option: current
        };
    })).returning();
    if (optionsResponse.length != options.length) {
        console.error("Error when inserting options!");
        return null;
    }
    return {
        id: response[0].choices_id,
        options: optionsResponse.map((current) => {
            return {
                id: current.option_id,
                option: current.option ?? "",
                order_index: current.orderIndex
            }
        }),
        questionText: response[0].question ?? "",
        editMode: true,
        order_index: response[0].choicesOrderIndex,
        required: response[0].required
    }
}

/**
 * Updates an existing choice question and its options.
 * 
 * @param choiceID - ID of the choice question to update.
 * @param questionText - New text for the choice question.
 * @param options - Array of updated options data for the choice question.
 * @param order_index - New order index for the question.
 * @returns A boolean indicating success or failure.
 */
export async function UpdateChoiceQuestion(choiceID: number, questionText: string, options: OptionsData[], order_index: number) {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;
    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        return false;
    }

    await db.update(choicesTable).set({
        question: questionText,
        choicesOrderIndex: order_index
    }).where(eq(choicesTable.choices_id, choiceID));

    await Promise.all(options.map((current) => {
        return db.update(choicesOptionsTable).set({
            option: current.option,
            orderIndex: current.order_index
        }).where(eq(choicesOptionsTable.option_id, current.id));
    }));
    return true;
}

/**
 * Creates a new option for an existing choice question.
 * 
 * @param choiceID - ID of the choice question to add the option to.
 * @param option - Option text.
 * @param order_index - Order index for the option.
 * @returns The created option data or null if not authorized.
 */
export async function CreateNewChoiceOption(choiceID: number, option: string, order_index: number): Promise<OptionsData | null> {
    const session = await getSession();
    if (session == null) {
        return null;
    }
    const user = session.user;
    const user_id = user.sub;
    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        return null;
    }

    const response = await db.insert(choicesOptionsTable).values({
        option: option,
        choices_id: choiceID,
        orderIndex: order_index
    }).returning();
    if (response.length == 0) {
        return null;
    }
    return {
        id: response[0].option_id,
        option: response[0].option ?? "",
        order_index: response[0].orderIndex
    }
}

/**
 * Deletes an existing choice option.
 * 
 * @param option_id - ID of the option to delete.
 * @returns A boolean indicating success or failure of the deletion.
 */
export async function DeleteChoiceOption(option_id: number): Promise<boolean> {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).leftJoin(choicesOptionsTable, eq(choicesOptionsTable.choices_id, choicesTable.choices_id)).where(and(eq(formsTable.user_id, user_id), eq(choicesOptionsTable.option_id, option_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(choicesOptionsTable).where(eq(choicesOptionsTable.option_id, option_id));
    return response.rowCount == 1;
}

/**
 * Deletes an existing choice question.
 * 
 * @param choices_id - ID of the choice question to delete.
 * @returns A boolean indicating success or failure of the deletion.
 */
export async function DeleteChoice(choices_id: number): Promise<boolean> {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(and(eq(choicesTable.choices_id, choices_id), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(choicesTable).where(eq(choicesTable.choices_id, choices_id));
    return response.rowCount == 1;
}

/**
 * Updates the order index of an existing choice question.
 * 
 * @param choices_id - ID of the choice question to update.
 * @param order_index - New order index for the choice question.
 * @returns A boolean indicating success or failure of the update.
 */
export async function UpdateChoiceOrderIndex(choices_id: number, order_index: number) {
    const session = await getSession();
    if (session == null) {
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [authData] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(and(eq(choicesTable.choices_id, choices_id), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(choicesTable).set({
        choicesOrderIndex: order_index
    }).where(eq(choicesTable.choices_id, choices_id));
    return response.rowCount != 0;
}

/**
 * Retrieves choice data for a form.
 * 
 * @param id - ID of the form to retrieve data for.
 * @param user_id - User ID for authentication.
 * @returns An object containing the structured choice data and form name.
 */
export async function GetChoicesData(id: string, user_id: string) {
    const formData = await db.select({
        formName: formsTable.name,
        choices_id: choicesTable.choices_id,
        choices_question: choicesTable.question,
        choices_order_index: choicesTable.choicesOrderIndex,
        choices_question_required: choicesTable.required,
        option_id: choicesOptionsTable.option_id,
        option: choicesOptionsTable.option,
        option_order_index: choicesOptionsTable.orderIndex,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(choicesTable, eq(choicesTable.form_id, id)).leftJoin(choicesOptionsTable, eq(choicesOptionsTable.choices_id, choicesTable.choices_id));

    if (formData.length == 0) {
        return {
            output: [],
            formName: ""
        }
    }
    const formName = formData[0].formName ?? "";
    const output = ChoicesDataProcess(formData);
    return { output: output, formName: formName };
}

/**
 * Processes raw form data from the database into a structured format.
 * 
 * @param formData - Array of raw data from SQL query.
 * @returns An array of questions formatted for the client.
 */
function ChoicesDataProcess(formData: {
    choices_id: number | null;
    choices_question: string | null;
    choices_order_index: number | null;
    choices_question_required: boolean | null;
    option_id: number | null;
    option: string | null;
    option_order_index: number | null;
}[]) {
    const choices: ChoiceData[] = [];
    formData.forEach(element => {
        let optionsList: OptionsData[] = [];
        let itemIndex = -1;
        choices.forEach((item, index) => {
            if (item.id == element.choices_id) {
                itemIndex = index;
                optionsList = item.options;
            }
        });
        if (itemIndex != -1) {
            optionsList.push({
                id: element.option_id ?? -1,
                option: element.option ?? "",
                order_index: element.option_order_index ?? -1
            });
            choices[itemIndex] = {
                id: element.choices_id ?? 0,
                questionText: element.choices_question ?? "",
                options: optionsList,
                editMode: false,
                order_index: element.choices_order_index ?? -1,
                required: element.choices_question_required ?? false,
            };
        }
        else {
            if (element.option != null) {
                optionsList.push({
                    id: element.option_id ?? -1,
                    option: element.option ?? "",
                    order_index: element.option_order_index ?? -1,
                });
            }
            if (element.choices_id != null) {
                choices.push({
                    id: element.choices_id,
                    questionText: element.choices_question ?? "",
                    options: optionsList,
                    editMode: false,
                    order_index: element.choices_order_index ?? -1,
                    required: element.choices_question_required ?? false,
                });
            }
        }
    });
    const output: question[] = choices.map((current) => {
        return {
            type: "Choice",
            data: current
        }
    });
    return output;
}