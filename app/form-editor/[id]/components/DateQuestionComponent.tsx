import { RxDragHandleDots2 } from "react-icons/rx";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { question } from "@/server/types";
import { DeleteDateQuestion, UpdateDateQuestion } from "@/server/dates";
import TextareaAutosize from 'react-textarea-autosize';
import { RiDeleteBin5Fill } from "react-icons/ri";
import { DraggableProvided } from "@hello-pangea/dnd";
import { useClickOutside } from "@/functions/useClickOutside";

export default function DateQuestionComponent({ justCreated, questions, setQuestions, index, provided }: { justCreated: boolean, questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number, provided: DraggableProvided }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    async function deleteCallback() {
        if (questions[index].type == 'Date') {
            const copy = [...questions];
            copy.splice(index, 1);
            // Disable input until the deletion in the database is confirmed
            setDeleted(true);
            await DeleteDateQuestion(questions[index].data.id);
            setQuestions(copy);
            setDeleted(false);
        }
    }

    function editModeSetFalse() {
        if (editMode != false && !deleted) {
            setEditMode(false);
            if (questions[index].type == 'Date') {
                UpdateDateQuestion(questions[index].data.id, questions[index].data.questionText, questions[index].data.order_index);
            }
        }
    }

    useClickOutside(ref, editModeSetFalse);

    return (
        <div ref={ref} onClick={() => setEditMode(true)} className="flex items-center">
            {editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-0.5 sm:px-3 pb-4 flex-grow">
                <div className="flex w-full flex-grow justify-end py-2">
                    <button disabled={deleted} className="btn btn-ghost btn-circle disabled:bg-transparent disabled:opacity-50 disabled:text-black btn-sm" type="button" onClick={deleteCallback}><RiDeleteBin5Fill size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <p className="text-xl font-bold py-1">{index + 1}.</p>
                    <div className="flex flex-col gap-3 flex-grow">
                        <TextareaAutosize disabled={deleted} className="w-full resize-none outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black" placeholder="Enter your question here..." value={questions[index].data.questionText} onChange={(current) => {
                            const copy = [...questions];
                            copy[index].data.questionText = current.target.value;
                            setQuestions(copy);
                        }} />
                        <TextareaAutosize disabled={true} placeholder="Date will be entered here" className="resize-none outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black placeholder-black hover:cursor-not-allowed"  />
                    </div>
                </div>
            </div>
            :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-3 sm:p-6 gap-3 hover:cursor-pointer flex-grow">
                <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
                <div className="flex flex-col gap-3 pl-4">
                    <div className="outline-none border-none bg-neutral-300 p-2 rounded-md disabled:opacity-50 disabled:text-black">
                        <p className="text-md text-black">Please input the date (yyyy-mm-dd) here</p>
                    </div>
                </div>
            </div> }
            <div {...provided.dragHandleProps}><RxDragHandleDots2 size={24} className="text-black" /></div>
        </div>
    )
}