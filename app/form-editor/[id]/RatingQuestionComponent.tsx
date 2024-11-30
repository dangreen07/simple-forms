"use client";

import { question } from "@/server/types";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export default function RatingQuestionComponent({ justCreated, questions, setQuestions, index, }: { justCreated: boolean, questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    
    return (
        <div ref={ref} onClick={() => setEditMode(true)}>
            { editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-3 pb-2">
                
            </div>
            :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-6 gap-3 hover:cursor-pointer">

            </div> }
        </div>
    )
}