"use server";

import { choicesOptionsTable, choicesTable, formsTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { CredentialsValid } from "./auth";
import { eq, and } from "drizzle-orm";
import { ChoiceData, OptionsData, question } from "./types";
import { getSession } from "@auth0/nextjs-auth0";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

export async function CreateNewChoicesQuestion(formID: number, questionText: string, options: string[], order_index: number): Promise<{ choicesID: number, options: OptionsData[], orderIndex: number } | null> {
    if(!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(choicesTable).values({
        question: questionText,
        form_id: formID,
        choicesOrderIndex: order_index
    }).returning();
    if (response.length == 0) {
        // Failed to insert choice question
        console.error("Failed to insert choice question!");
        return null;
    }

    // Add the options
    const optionsResponse = await db.insert(choicesOptionsTable).values(options.map((current) => {
        return {
            choices_id: response[0].choices_id,
            option: current
        };
    })).returning();
    if (optionsResponse.length != options.length) {
        // Something went wrong inputting options!
        console.error("Error when inserting options!");
        return null;
    }
    return {
        choicesID: response[0].choices_id,
        options: optionsResponse.map((current) => {
            return {
                id: current.option_id,
                option: current.option ?? "",
                order_index: current.orderIndex
            }
        }),
        orderIndex: response[0].choicesOrderIndex
    }
}

export async function UpdateChoiceQuestion(choiceID: number, questionText: string, options: OptionsData[], order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;
    const [ authData ] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        // Not authorized to access this resource
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

export async function CreateNewChoiceOption(choiceID: number, option: string, order_index: number): Promise<OptionsData | null> {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return null;
    }
    const user = session.user;
    const user_id = user.sub;
    const [ authData ] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(eq(formsTable.user_id, user_id));
    if (authData == undefined) {
        // Not authorized to access this resource
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

export async function DeleteChoiceOption(option_id: number): Promise<boolean> {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).leftJoin(choicesOptionsTable, eq(choicesOptionsTable.choices_id, choicesTable.choices_id)).where(and(eq(formsTable.user_id, user_id), eq(choicesOptionsTable.option_id, option_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(choicesOptionsTable).where(eq(choicesOptionsTable.option_id, option_id));
    if (response.rowCount == 1) {
        return true;
    }
    else {
        return false;
    }
}

export async function DeleteChoice(choices_id: number): Promise<boolean> {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(and(eq(choicesTable.choices_id, choices_id), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(choicesTable).where(eq(choicesTable.choices_id, choices_id));
    if (response.rowCount == 1) {
        return true;
    }
    else {
        return false;
    }
}

export async function UpdateChoiceOrderIndex(choices_id: number, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(choicesTable, eq(choicesTable.form_id, formsTable.id)).where(and(eq(choicesTable.choices_id, choices_id), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(choicesTable).set({
        choicesOrderIndex: order_index
    }).where(eq(choicesTable.choices_id, choices_id));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function GetChoicesData(id: number, user_id: string) {
    const formData = await db.select({
        formName: formsTable.name,
        // Choices
        choices_id: choicesTable.choices_id,
        choices_question: choicesTable.question,
        choices_order_index: choicesTable.choicesOrderIndex,
        // Choices options
        option_id: choicesOptionsTable.option_id,
        option: choicesOptionsTable.option,
        option_order_index: choicesOptionsTable.orderIndex,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(choicesTable, eq(choicesTable.form_id, id)).leftJoin(choicesOptionsTable, eq(choicesOptionsTable.choices_id, choicesTable.choices_id));
    // Format the raw sql data into something the client will understand
    if (formData.length == 0) {
        // No form was found
        return {
            output: [],
            formName: ""
        }
    }
    const formName = formData[0].formName ?? "";
    const output = ChoicesDataProcess(formData);
    return { output: output, formName: formName };
}

function ChoicesDataProcess(formData: {
    choices_id: number | null;
    choices_question: string | null;
    choices_order_index: number | null;
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
            // Any of the values in the choices array are the same as the current element
            optionsList.push({
                id: element.option_id ?? -1,
                option: element.option ?? "",
                order_index: element.option_order_index ?? -1
            });
            choices[itemIndex] = {
                id: element.choices_id??0,
                questionText: element.choices_question??"",
                options: optionsList,
                editMode: false,
                order_index: element.choices_order_index??-1,
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
                // There are no choices here
                choices.push({
                    id: element.choices_id,
                    questionText: element.choices_question ?? "",
                    options: optionsList,
                    editMode: false,
                    order_index: element.choices_order_index ?? -1,
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