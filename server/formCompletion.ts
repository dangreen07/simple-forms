"use server";

import { db } from "@/db/database";
import { choiceQuestionResponsesTable, choicesTable, dateQuestionResponsesTable, dateQuestionTable, formsTable, rankingOptionResponsesTable, rankingQuestionResponsesTable, rankingQuestionTable, ratingQuestionResponsesTable, ratingQuestionTable, textQuestionResponsesTable, textQuestionsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clientResponse } from "./types";
import { GetChoicesData } from "./choices";
import { GetTextQuestionsData } from "./textQuestions";
import { GetRatingQuestionsData } from "./ratings";
import { GetDateQuestionsData } from "./dates";
import { GetRankingQuestionsData } from "./rankingQuestions";

export async function SubmitCompletedForm(formID: string, responses: clientResponse[]) {
    const formData = await db.select().from(formsTable).where(eq(formsTable.id, formID));

    const [ choicesData, textData, ratingData, dateData, rankingData ] = await Promise.all([
        GetChoicesData(formID, formData[0].user_id),
        GetTextQuestionsData(formID, formData[0].user_id),
        GetRatingQuestionsData(formID, formData[0].user_id),
        GetDateQuestionsData(formID, formData[0].user_id),
        GetRankingQuestionsData(formID, formData[0].user_id)
    ]);

    if (choicesData.output.length + textData.length + ratingData.length + dateData.length + rankingData.length != responses.length){
        // Invalid response count
        return null;
    }

    for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        if (response.questionType == "Choice") {
            // Handle a choice question response
            const current = choicesData.output.find((current) => current.data.id == response.questionID);
            if (current == undefined) {
                // Invalid response
                continue;
            }
            if (current.data.editable == true) {
                await db.update(choicesTable)
                .set({
                    editable: false
                })
                .where(
                    eq(
                        choicesTable.choices_id,
                        response.questionID
                    )
                );
            }
            await db.insert(choiceQuestionResponsesTable).values({
                form_id: formID,
                choices_id: response.questionID,
                option_id: response.response
            });
        }
        else if (response.questionType == "Text") {
            // Handle a text question response
            const current = textData.find((current) => current.data.id == response.questionID);
            if (current == undefined) {
                // Invalid response
                continue;
            }
            if (current.data.editable == true) {
                await db.update(textQuestionsTable)
                .set({
                    editable: false
                })
                .where(
                    eq(
                        textQuestionsTable.text_question_id,
                        response.questionID
                    )
                );
            }
            await db.insert(textQuestionResponsesTable).values({
                form_id: formID,
                text_id: response.questionID,
                response: response.response
            });
        }
        else if (response.questionType == "Rating") {
            // Handle a rating question response
            const current = ratingData.find((current) => current.data.id == response.questionID);
            if (current == undefined) {
                // Invalid response
                continue;
            }
            if (current.data.editable == true) {
                await db.update(ratingQuestionTable)
                .set({
                    editable: false
                })
                .where(
                    eq(
                        ratingQuestionTable.rating_question_id,
                        response.questionID
                    )
                );
            }
            await db.insert(ratingQuestionResponsesTable).values({
                form_id: formID,
                rating_id: response.questionID,
                response: response.response
            });
        }
        else if (response.questionType == "Date") {
            // Handle a date question response
            const current = dateData.find((current) => current.data.id == response.questionID);
            if (current == undefined) {
                // Invalid response
                continue;
            }
            if (current.data.editable == true) {
                await db.update(dateQuestionTable)
                .set({
                    editable: false
                })
                .where(
                    eq(
                        dateQuestionTable.date_question_id,
                        response.questionID
                    )
                );
            }
            await db.insert(dateQuestionResponsesTable).values({
                form_id: formID,
                date_id: response.questionID,
                response: response.response.toDateString()
            });
        }
        else if (response.questionType == "Ranking") {
            // Handle a ranking question response
            const current = rankingData.find((current) => current.data.id == response.questionID);
            if (current == undefined) {
                // Invalid response
                continue;
            }
            if (current.data.editable == true) {
                await db.update(rankingQuestionTable)
                .set({
                    editable: false
                })
                .where(
                    eq(
                        rankingQuestionTable.ranking_question_id,
                        response.questionID
                    )
                );
            }
            const currentResponse = await db.insert(rankingQuestionResponsesTable).values({
                form_id: formID,
                ranking_id: response.questionID
            }).returning();
            const currentResponseID = currentResponse[0].response_id;
            await db.insert(rankingOptionResponsesTable).values(response.response.map((_current, index) => {
                return {
                    order: index,
                    response_id: currentResponseID
                }
            }));
        }
    }
}