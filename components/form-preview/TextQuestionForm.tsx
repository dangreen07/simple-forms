"use client";

import { question } from "@/server/types";
import TextareaAutosize from 'react-textarea-autosize';

export default function TextQuestionForm({ questions, index }: { questions: question[], index: number }) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
            <div className="flex flex-col gap-3 pl-4">
                <TextareaAutosize placeholder="Enter your answer" className="resize-none outline-none border-none bg-neutral-300 p-2 rounded-md " />
            </div>
        </div>
    )
}