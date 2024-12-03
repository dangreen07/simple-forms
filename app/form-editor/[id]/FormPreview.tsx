"use client";

import { question } from "@/server/types";
// These can be loaded normally as they are quite small
import ChoiceQuestionPreview from "./components/preview-page/ChoiceQuestionPreview";
import TextQuestionPreview from "./components/preview-page/TextQuestionPreview";
import RatingQuestionPreview from "./components/preview-page/RatingQuestionPreview";
import DateQuestionPreview from "./components/preview-page/DateQuestionPreview";
import RankingQuestionPreview from "./components/preview-page/RankingQuestionPreview";

export default function FormPreview({ questions, formName }: { questions: question[], formName: string }) {
    function outputPreviewQuestions(question: question, index: number) {
        if (question.type == "Choice") {
            return <ChoiceQuestionPreview key={index} questions={questions} index={index} />
        }
        else if (question.type == "Text") {
            return <TextQuestionPreview key={index} questions={questions} index={index} />
        }
        else if (question.type == "Rating") {
            return <RatingQuestionPreview key={index} questions={questions} index={index} />
        }
        else if (question.type == "Date") {
            return <DateQuestionPreview key={index} questions={questions} index={index} />
        }
        else if (question.type == "Ranking") {
            return <RankingQuestionPreview key={index} questions={questions} index={index} />
        }
    }
    
    return (
    <div className="flex justify-center flex-grow">
        <div className="bg-neutral-100 max-w-6xl flex-grow mb-6 rounded-lg">
            <div id="form-content" className="w-full flex flex-col text-black px-2 md:px-12 py-8 md:py-16 gap-4">
                <p className="resize-none text-3xl sm:text-4xl md:text-5xl font-semibold bg-neutral-100 border-none outline-none w-full">{formName}</p>
                <div className="flex flex-col p-4 gap-6">
                    {questions.sort((a,b) => a.data.order_index - b.data.order_index).map((current, index) => outputPreviewQuestions(current, index))}
                </div>
                <div className="flex justify-center items-center">
                    <button className="btn btn-primary text-white btn-lg btn-wide">Submit</button>
                </div>
            </div>
        </div>
    </div>
    )
}