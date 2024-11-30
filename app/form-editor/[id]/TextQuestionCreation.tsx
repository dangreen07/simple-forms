"use client";

import { question } from "@/server/types";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { RiDeleteBin5Fill } from "react-icons/ri";
import TextareaAutosize from 'react-textarea-autosize';
import { useClickOutside } from "./ChoiceCreation";
import { DeleteTextQuestion, UpdateTextQuestion } from "@/server/textQuestions";

export default function TextQuestionCreation({ justCreated, questions, setQuestions, index }: { justCreated: boolean, questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    async function deleteCallback() {
        if (questions[index].type == 'Text') {
            const copy = [...questions];
            copy.splice(index, 1);
            // Disable input until the deletion in the database is confirmed
            setDeleted(true);
            await DeleteTextQuestion(questions[index].data.textId);
            setQuestions(copy);
            setDeleted(false);
        }
    }

    function editModeSetFalse() {
        if (editMode != false && !deleted) {
            setEditMode(false);
            if (questions[index].type == 'Text') {
                UpdateTextQuestion(questions[index].data.textId, questions[index].data.questionText, questions[index].data.order_index);
            }
        }
    }

    useClickOutside(ref, editModeSetFalse);

    return (
        <div ref={ref} onClick={() => setEditMode(true)}>
            {editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-3 pb-4">
                <div className="flex w-full flex-grow justify-end py-2">
                    <button disabled={deleted} className="btn btn-ghost btn-circle disabled:bg-transparent disabled:opacity-50 disabled:text-black btn-sm" type="button" onClick={deleteCallback}><RiDeleteBin5Fill size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <p className="text-xl font-bold py-1">{index + 1}.</p>
                    <div className="flex flex-col gap-3 flex-grow">
                        <input disabled={deleted} type="text" className="outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black" placeholder="Enter your question here..." value={questions[index].data.questionText} onChange={(current) => {
                            const copy = [...questions];
                            copy[index].data.questionText = current.target.value;
                            setQuestions(copy);
                        }} />
                        <TextareaAutosize disabled={true} placeholder="Answer will go here" className="resize-none outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black placeholder-black hover:cursor-not-allowed"  />
                    </div>
                </div>
            </div>
            :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-6 gap-3 hover:cursor-pointer">
                <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
                <div className="resize-none outline-none border-none bg-neutral-300 mx-5 p-2 rounded-md disabled:opacity-100 disabled:text-black placeholder-black cursor-pointer">
                    <p>Enter your answer</p>
                </div>
            </div>}
        </div>
    )
}