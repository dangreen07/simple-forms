"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { question, DateData } from "./types";
import { CredentialsValid } from "./auth";
import { formsTable, dateQuestionTable } from "@/db/schema";
import { getSession } from "@auth0/nextjs-auth0";
import { eq, and } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (DATABASE_URL == "") {
    throw Error("Database url is not set in the enviroment variables file!");
}

const db = drizzle(DATABASE_URL);

export async function CreateNewDateQuestion(formID: number, question: string, orderIndex: number): Promise<null | DateData> {
    if (!(await CredentialsValid(formID))) {
        return null;
    }
    const response = await db.insert(dateQuestionTable).values({
        question: question,
        form_id: formID,
        orderIndex: orderIndex
    }).returning();

    if (response.length == 0) {
        // Failed to insert date question
        console.error("Failed to insert date question!");
        return null;
    }

    return {
        id: response[0].date_question_id,
        questionText: response[0].question ?? "",
        order_index: response[0].orderIndex,
        required: response[0].required
    }
}

export async function DeleteDateQuestion(questionID: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.delete(dateQuestionTable).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function UpdateDateQuestion(questionID: number, questionText: string, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;
    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    
    const response = await db.update(dateQuestionTable).set({
        question: questionText,
        orderIndex: order_index
    }).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function UpdateDateQuestionOrderIndex(questionID: number, order_index: number) {
    // Credentials checking
    const session = await getSession();
    if (session == null) {
        // User not defined
        return false;
    }
    const user = session.user;
    const user_id = user.sub;

    const [ authData ] = await db.select().from(formsTable).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id)).where(and(eq(dateQuestionTable.date_question_id, questionID), eq(formsTable.user_id, user_id)));
    if (authData == undefined) {
        return false;
    }
    const response = await db.update(dateQuestionTable).set({
        orderIndex: order_index
    }).where(eq(dateQuestionTable.date_question_id, questionID));
    if (response.rowCount == 0) {
        return false;
    }
    return true;
}

export async function GetDateQuestionsData(id: number, user_id: string) {
    const formData = await db.select({
        date_question_id: dateQuestionTable.date_question_id,
        question: dateQuestionTable.question,
        order_index: dateQuestionTable.orderIndex,
        date_question_required: dateQuestionTable.required,
    }).from(formsTable).where(and(
        eq(formsTable.id, id),
        eq(formsTable.user_id, user_id)
    )).leftJoin(dateQuestionTable, eq(dateQuestionTable.form_id, formsTable.id));

    if (formData.length == 0) {
        return [];
    }
    const output = DateDataProcess(formData);
    return output;
}

function DateDataProcess(formData: {
    date_question_id: number | null;
    question: string | null;
    order_index: number | null;
    date_question_required: boolean | null;
}[]): question[] {
    return formData.filter((current) => current.date_question_id != null).map((element) => {
        return {
            type: "Date",
            data: {
                id: element.date_question_id ?? -1,
                questionText: element.question ?? "",
                order_index: element.order_index ?? -1,
                required: element.date_question_required ?? false
            }
        }
    })
}