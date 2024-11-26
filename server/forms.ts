"use server";

import { getSession } from "@auth0/nextjs-auth0";
import { ChoiceData, question } from "./types";
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
        option: choicesOptionsTable.option 
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
        let optionsList: string[] = [];
        let itemIndex = -1;
        choices.forEach((item, index) => {
            if (item.choiceId == element.choices_id) {
                itemIndex = index;
                optionsList = item.options;
            }
        });
        if (itemIndex != -1) {
            // Any of the values in the choices array are the same as the current element
            optionsList.push(element.option ?? "");
            choices[itemIndex] = {
                choiceId: element.choices_id??0,
                questionText: element.question??"",
                options: optionsList,
                editMode: false
            };
        }
        else {
            if (element.option != null) {
                optionsList.push(element.option);
            }
            choices.push({
                choiceId: element.choices_id ?? 0,
                questionText: element.question ?? "",
                options: optionsList,
                editMode: false
            });
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

// This will run when the user saves the new form for the first time
export async function CreateNewForm(name: string, questions: question[]): Promise<number | null> {
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
    // Start adding the questions to the database
    const cQuestions: question[] = questions.filter((current) => current.type == "Choice");
    if (cQuestions.length == 0) {
        return formID;
    }
    const mappedChoiceQuestions = questions.map((current) => {
        if (current.type == 'Choice') {
            return current.data;
        }
    }).filter((current) => current != undefined);
    
    const output = await db.insert(choicesTable).values(mappedChoiceQuestions.map((current) => {
        return {
            question: current.questionText,
            form_id: formID
        }
    })).returning();

    if (output.length != mappedChoiceQuestions.length) {
        // Something went wrong
        console.error(`Failed to create a new forms choices. Created ${output.length} values and should've created ${cQuestions.length} values.`);
    }
    for(let i = 0; i < output.length; i++) {
        if (mappedChoiceQuestions[i].options.length == 0)
            continue;
        // const current = await sql(`INSERT INTO choices_options(option, choices_id) VALUES ${mappedInput.join(", ")} RETURNING *`);
        const current = await db.insert(choicesTable).values(mappedChoiceQuestions[i].options.map((current) => {
            return {
                option: current,
                choices_id: output[i].choices_id
            };
        })).returning();
        if (current.length != mappedChoiceQuestions.length) {
            // Something went wrong
            console.error("Failed to create options for the choices on the new form!")
        }
    }
    return formID;
}

