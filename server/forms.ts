"use server";

import { getSession } from "@auth0/nextjs-auth0";
import { ChoiceData, OptionsData, question } from "./types";
import { drizzle } from "drizzle-orm/neon-http";
import { choicesOptionsTable, choicesTable, formsTable } from "@/db/schema";
import { eq, and } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

/**
 * 
 * @param id The form id
 * @returns The form name
 */
export async function GetFormName(id: number): Promise<string> {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return "";
    }
    const user = session.user;
    const user_id = user.sub;
    const [ formData ] = await db.select().from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    ))
    if (formData == undefined) {
        // Invalid id or invalid credentials
        return "";
    }
    const output = formData as { id: number, name: string, user_id: string };
    return output.name;
}

export async function GetFormData(id: number) {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return null;
    }
    const user = session.user;
    const user_id = user.sub;
    const formData = await db.select({
        formID: formsTable.id,
        formName: formsTable.name,
        user_id: formsTable.user_id,
        choices_id: choicesTable.choices_id,
        question: choicesTable.question,
        option_id: choicesOptionsTable.option_id,
        option: choicesOptionsTable.option,
        option_order_index: choicesOptionsTable.orderIndex,
        choices_order_index: choicesTable.choicesOrderIndex
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(choicesTable, eq(choicesTable.form_id, id)).leftJoin(choicesOptionsTable, eq(choicesOptionsTable.choices_id, choicesTable.choices_id));
    // Format the raw sql data into something the client will understand
    if (formData.length == 0) {
        // No form was found
        return null;
    }
    const formName = formData[0].formName ?? "";
    const choices: ChoiceData[] = [];
    formData.forEach(element => {
        let optionsList: OptionsData[] = [];
        let itemIndex = -1;
        choices.forEach((item, index) => {
            if (item.choiceId == element.choices_id) {
                itemIndex = index;
                optionsList = item.options;
            }
        });
        if (itemIndex != -1) {
            // Any of the values in the choices array are the same as the current element
            optionsList.push({
                option_id: element.option_id ?? -1,
                option: element.option ?? "",
                order_index: element.option_order_index ?? -1
            });
            choices[itemIndex] = {
                choiceId: element.choices_id??0,
                questionText: element.question??"",
                options: optionsList,
                editMode: false,
                order_index: element.choices_order_index??-1,
            };
        }
        else {
            if (element.option != null) {
                optionsList.push({
                    option_id: element.option_id ?? -1,
                    option: element.option ?? "",
                    order_index: element.option_order_index ?? -1,
                });
            }
            if (element.choices_id != null) {
                // There are no choices here
                choices.push({
                    choiceId: element.choices_id,
                    questionText: element.question ?? "",
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
    return {
        formName: formName,
        questions: output
    };
}


export async function CreateNewForm(name: string): Promise<number | null> {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return null;
    }
    const user = session.user;
    const user_id = user.sub;

    const response = await db.insert(formsTable).values({
        name: name,
        user_id: user_id
    }).returning();
    const formID: number = response[0].id;
    return formID;
}

export async function GetForms() {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return [];
    }
    const user = session.user;
    const user_id = user.sub;

    const response = await db.select().from(formsTable).where(eq(formsTable.user_id, user_id));
    return response.map((current) => {
        return {
            id: current.id,
            name: current.name
        }
    });
}

export async function UpdateFormTitle(formID: number, formTitle: string) {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return [];
    }
    const user = session.user;
    const user_id = user.sub;

    const response = await db.update(formsTable).set({
        name: formTitle
    }).where(and(eq(formsTable.user_id, user_id), eq(formsTable.id, formID)));
    if (response.rowCount == 1) {
        return true;
    }
    return false;
}