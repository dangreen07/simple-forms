"use server";

import { getSession } from "@auth0/nextjs-auth0";
import { drizzle } from "drizzle-orm/neon-http";
import { formsTable } from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import { GetTextQuestionsData } from "./textQuestions";
import { GetChoicesData } from "./choices";

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
    const output = [];
    const { output: choicesOutput, formName } = await GetChoicesData(id, user_id);
    output.push(...choicesOutput);
    const textQuestionsOutput = await GetTextQuestionsData(id, user_id);
    output.push(...textQuestionsOutput);
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