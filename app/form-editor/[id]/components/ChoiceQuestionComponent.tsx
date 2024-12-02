"use client";

import { useClickOutside } from "@/functions/useClickOutside";
import { CreateNewChoiceOption, DeleteChoice, DeleteChoiceOption, UpdateChoiceQuestion } from "@/server/choices";
import { question } from "@/server/types";
import { DraggableProvided } from "@hello-pangea/dnd";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";
import TextareaAutosize from 'react-textarea-autosize';

export default function ChoiceQuestionComponent({ questions, setQuestions, index, justCreated, provided }: {  questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number, justCreated: boolean, provided: DraggableProvided }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    async function deleteCallback() {
        if (questions[index].type == 'Choice') {
            const copy = [...questions];
            copy.splice(index, 1);
            // Disable input until the deletion in the database is confirmed
            setDeleted(true);
            await DeleteChoice(questions[index].data.id);
            setQuestions(copy);
            setDeleted(false);
        }
    }

    function editModeSetFalse() {
        if (editMode != false && !deleted) {
            setEditMode(false);
            if (questions[index].type == 'Choice') {
                UpdateChoiceQuestion(questions[index].data.id, questions[index].data.questionText, questions[index].data.options, questions[index].data.order_index);
            }
        }
    }

    useClickOutside(ref, editModeSetFalse);

    // Mainly for the error checking, won't happen if all runs well
    if (questions[index].type != "Choice") {
        return <div></div>
    }

    return (
        <div ref={ref} onClick={() => setEditMode(true)} className="flex items-center">
            { editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-0.5 sm:px-3 pb-2 flex-grow">
                {/* We are in the edit mode here */}
                <div className="flex w-full flex-grow justify-end py-2">
                    <button disabled={deleted} className="btn btn-ghost btn-circle disabled:bg-transparent disabled:opacity-50 disabled:text-black btn-sm" type="button" onClick={deleteCallback}><RiDeleteBin5Fill size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <p className="text-xl font-bold py-1">{index + 1}.</p>
                    <div className="flex flex-col gap-3 flex-grow">
                        <TextareaAutosize disabled={deleted} className="resize-none outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black w-fill" placeholder="Enter your question here..." value={questions[index].data.questionText} onChange={(current) => {
                            const copy = [...questions];
                            copy[index].data.questionText = current.target.value;
                            setQuestions(copy);
                        }} />
                        {questions[index].data.options.sort((a, b) => a.order_index - b.order_index).map((item, i) => {
                            if (item.order_index == -1) {
                                if (questions[index].type == "Choice")
                                    questions[index].data.options[i].order_index = i;
                            }
                            return (
                                <div key={i} className="flex gap-3 items-center">
                                    <span className="flex items-center justify-center">
                                        <MdOutlineRadioButtonChecked size={24} />
                                    </span>
                                    <TextareaAutosize disabled={deleted} className="outline-none border-none bg-neutral-100 p-2 rounded-md disabled:opacity-50 disabled:text-black w-full max-w-72 resize-none" value={item.option} onChange={(current) => {
                                        const copy = [...questions];
                                        if (copy[index].type != "Choice") {
                                            return;
                                        }
                                        copy[index].data.options[i].option = current.target.value;
                                        setQuestions(copy);
                                    }} />
                                    <button disabled={deleted} className="btn btn-ghost btn-circle disabled:bg-transparent disabled:opacity-50 disabled:text-red-600 btn-sm text-red-600" type="button" onClick={() => {
                                        const copy = [...questions];
                                        if (copy[index].type != "Choice") {
                                            return;
                                        }
                                        DeleteChoiceOption(copy[index].data.options[i].id);
                                        copy[index].data.options.splice(i,1);
                                        setQuestions(copy);
                                    }}><RiDeleteBin5Fill size={24} /></button>
                                </div>
                            )
                        })}
                        <button disabled={deleted} type="button" className="flex gap-3 w-fit disabled:opacity-50" onClick={async () => {
                            const copy = [...questions];
                            if (copy[index].type != "Choice") {
                                return;
                            }
                            const response = await CreateNewChoiceOption(questions[index].data.id, "", copy[index].data.options.length);
                            if (response == null)
                                return;
                            copy[index].data.options.push(response);
                            setQuestions(copy);
                        }}><FiPlus size={24} /> Add New Option</button>
                    </div>
                </div>
            </div> :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-3 sm:p-6 gap-3 hover:cursor-pointer flex-grow">
                <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
                <div className="flex flex-col gap-3">
                    {questions[index].data.options.sort((a, b) => a.order_index - b.order_index).map((item, index) => {
                        return (
                            <div key={index} className="flex px-5 gap-2 items-center">
                                <span className="flex items-center justify-center">
                                    <MdOutlineRadioButtonUnchecked size={24} />
                                </span>
                                <p className="font-semibold">{item.option}</p>
                            </div>
                        )
                    })}
                </div>
            </div> }
            <div {...provided.dragHandleProps}><RxDragHandleDots2 size={24} className="text-black" /></div>
        </div>
    );
}