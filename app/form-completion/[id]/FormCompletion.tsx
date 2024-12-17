"use client";

import { clientResponse, question } from "@/server/types";
import CompletionChoice from "./components/CompletionChoice";
import CompletionText from "./components/CompletionText";
import CompletionRating from "./components/CompletionRating";
import CompletionDate from "./components/CompletionDate";
import CompletionRanking from "./components/CompletionRanking";
import { useState } from "react";
import { SubmitCompletedForm } from "@/server/formCompletion";
import { useRouter } from "next/navigation";

export default function FormCompletion({ questions, formID }: { questions: question[], formID: string }) {
    const [responses, setResponses] = useState<clientResponse[]>([]);

    const router = useRouter();

    function outputFormCompletionQuestions(question: question, index: number) {
        if (question.type == "Choice") {
            return <CompletionChoice key={index} questions={questions} index={index} responses={responses} setResponses={setResponses} />
        }
        else if (question.type == "Text") {
            return <CompletionText key={index} questions={questions} index={index} responses={responses} setResponses={setResponses} />
        }
        else if (question.type == "Rating") {
            return <CompletionRating key={index} questions={questions} index={index} responses={responses} setResponses={setResponses} />
        }
        else if (question.type == "Date") {
            return <CompletionDate key={index} questions={questions} index={index} responses={responses} setResponses={setResponses} />
        }
        else if (question.type == "Ranking") {
            return <CompletionRanking key={index} questions={questions} index={index} responses={responses} setResponses={setResponses} />
        }
    }

    return (
        <div className="flex flex-col justify-center gap-4 p-6">
            {questions.map((current, index) => outputFormCompletionQuestions(current, index))}
            <div className="flex justify-center items-center">
                <button onClick={() => {
                    SubmitCompletedForm(formID, responses);
                    // Redirect away from the page
                    router.push("/");
                }} className="btn btn-primary text-white btn-lg btn-wide bg-blue-700 hover:bg-blue-700 hover:opacity-90">Submit</button>
            </div>
        </div>
    )
}