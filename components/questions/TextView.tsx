"use client";

import { question } from "@/server/types";
import { ChangeEvent } from "react";
import TextareaAutosize from 'react-textarea-autosize';

export default function TextView({ questions, index, handleChange = () => {} }: { questions: question[], index: number, handleChange?: (current: ChangeEvent<HTMLTextAreaElement>) => void }) {
    if (questions[index].type != "Text") {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <TextareaAutosize className="input input-bordered w-full resize-none p-2" onChange={(current) => handleChange(current)} />
        </div>
    )
}