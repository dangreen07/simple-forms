"use server";

import { getSession } from "@auth0/nextjs-auth0";
import { neon } from "@neondatabase/serverless";
import { question } from "./types";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

/**
 * 
 * @param id The form id
 * @returns The form name
 */
export async function GetFormName(id: string): Promise<string> {
    const session = await getSession();
    if (session == null) {
        // User not defined
        return "";
    }
    const user = session.user;
    const user_id = user.sub;
    const sql = neon(DATABASE_URL);
    // This is possibly vulnerable to sql injection
    const [ formData ] = await sql`SELECT * FROM forms WHERE id = ${id} and user_id = ${user_id}`;
    if (formData == undefined) {
        // Invalid id or invalid credentials
        return "";
    }
    const output = formData as { id: number, name: string, user_id: string };
    return output.name;
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

    const sql = neon(DATABASE_URL);
    const response = await sql(`INSERT INTO forms(name, user_id) VALUES ('${name}', '${user_id}') RETURNING *`);
    const formID: number = response[0].id;
    // Start adding the questions to the database
    const cQuestions: question[] = questions.filter((current) => current.type == "Choice");
    if (cQuestions.length == 0) {
        return formID;
    }
    const mappedChoiceQuestions = cQuestions.map((current) => {
        return `('${current.data.questionText}', ${formID})`;
    });
    
    const output = await sql(`INSERT INTO choices(question, form_id) VALUES ${mappedChoiceQuestions.join(", ")} RETURNING *`);
    if (output.length != cQuestions.length) {
        // Something went wrong
        console.error(`Failed to create a new forms choices. Created ${output.length} values and should've created ${cQuestions.length} values.`);
    }
    for(let i = 0; i < output.length; i++) {
        if ((cQuestions[i].data as {
            questionText: string;
            options: string[];
            editMode: boolean;
            questionNumber: number;
        }).options.length == 0)
            continue;
        const mappedInput = (cQuestions[i].data as {
            questionText: string;
            options: string[];
            editMode: boolean;
            questionNumber: number;
        }).options.map((item: string) => {
            return `('${item}', ${output[i].choices_id})`;
        })
        console.log(`INSERT INTO choices_options(option, choices_id) VALUES ${mappedInput.join(", ")} RETURNING *`);
        const current = await sql(`INSERT INTO choices_options(option, choices_id) VALUES ${mappedInput.join(", ")} RETURNING *`);
        if (current.length != mappedInput.length) {
            // Something went wrong
            console.error("Failed to create options for the choices on the new form!")
        }
    }
    return formID;
}
