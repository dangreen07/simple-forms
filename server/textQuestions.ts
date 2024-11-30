"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { CredentialsValid } from "./auth";
import { choicesTable, formsTable, textQuestionsTable } from "@/db/schema";
import { question, TextData } from "./types";
import { getSession } from "@auth0/nextjs-auth0";
import { eq, and } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

export async function CreateNewTextQuestion(formID: number, question: string, orderIndex: number): Promise<null | TextData> {
    if(!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(textQuestionsTable).values({
        question: question,
        form_id: formID,
        textOrderIndex: orderIndex
    }).returning();

    if (response.length == 0) {
        // Failed to insert text question
        console.error("Failed to insert text question!");
        return null;
    }

    return {
        id: response[0].text_question_id,
        questionText: response[0].question??"",
        order_index: response[0].textOrderIndex
    }
}

export async function UpdateTextQuestion(questionID: number, questionText: string, order_index: number) {
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
    
    const response = await db.update(textQuestionsTable).set({
        question: questionText,
        textOrderIndex: order_index
    }).where(eq(textQuestionsTable.text_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function DeleteTextQuestion(questionID: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(textQuestionsTable, eq(textQuestionsTable.form_id, formsTable.id)).where(and(eq(textQuestionsTable.text_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(textQuestionsTable).where(eq(textQuestionsTable.text_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
     return true;
}

export async function UpdateTextQuestionOrderIndex(questionID: number, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(textQuestionsTable, eq(textQuestionsTable.form_id, formsTable.id)).where(and(eq(textQuestionsTable.text_question_id, questionID), eq(formsTable.user_id, user_id)));
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

export async function GetTextQuestionsData(id: number, user_id: string) {
    const formData = await db.select({
        text_id: textQuestionsTable.text_question_id,
        question: textQuestionsTable.question,
        order_index: textQuestionsTable.textOrderIndex
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

function TextDataProcess(formData: {
    text_id: number | null;
    question: string | null;
    order_index: number | null;
}[]): question[] {
    return formData.filter((current) => current.text_id != null).map((element) => {
        return {
            type: 'Text',
            data: {
                id: element.text_id??-1,
                questionText: element.question??"",
                order_index: element.order_index??-1
            }
        }
    })
}
