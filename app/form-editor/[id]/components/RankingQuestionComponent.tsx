"use client";

import { CreateNewRankingOption, DeleteRankingOption, DeleteRankingQuestion, UpdateRankingQuestion } from "@/server/rankingQuestions";
import { question } from "@/server/types";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { DraggableProvided } from "@hello-pangea/dnd";
import { RxDragHandleDots2 } from "react-icons/rx";
import TextareaAutosize from 'react-textarea-autosize';
import { FiPlus } from "react-icons/fi";
import { useClickOutside } from "@/functions/useClickOutside";

export default function RankingQuestionComponent({ justCreated, questions, setQuestions, index, provided }: { justCreated: boolean, questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number, provided: DraggableProvided }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    async function deleteCallback() {
        if (questions[index].type == 'Ranking') {
            const copy = [...questions];
            copy.splice(index, 1);
            // Disable input until the deletion in the database is confirmed
            setDeleted(true);
            await DeleteRankingQuestion(questions[index].data.id);
            setQuestions(copy);
            setDeleted(false);
        }
    }

    function editModeSetFalse() {
        if (editMode != false && !deleted) {
            setEditMode(false);
            if (questions[index].type == 'Ranking') {
                UpdateRankingQuestion(questions[index].data.id, questions[index].data.questionText, questions[index].data.rankOptions, questions[index].data.order_index);
            }
        }
    }

    useClickOutside(ref, editModeSetFalse);

    if (questions[index].type != 'Ranking') {
        return <div>Invalid question type</div>
    }

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
                        <div className="flex flex-col gap-3">
                            {questions[index].data.rankOptions.sort((a,b) => a.order_index - b.order_index).map((current, i) => {
                                if (current.order_index == -1) {
                                    const copy = [...questions];
                                    if (copy[index].type != "Ranking") {
                                        return;
                                    }
                                    copy[index].data.rankOptions[i].order_index = i;
                                    setQuestions(copy);
                                }
                                return (
                                <div key={"Rank-Option-" + current.id} className="flex border-[2px] rounded-md items-center gap-2">
                                    <input type="text" className="w-full rounded-md p-2 outline-none border-none bg-neutral-100 disabled:opacity-50 disabled:text-black" placeholder="Enter your option here..." value={current.option} onChange={(current) => {
                                        const copy = [...questions];
                                        if (copy[index].type != 'Ranking') {
                                            return;
                                        }
                                        copy[index].data.rankOptions[i].option = current.target.value;
                                        setQuestions(copy);
                                    }} />
                                    <button disabled={deleted} type="button" className="btn btn-ghost btn-circle disabled:bg-transparent disabled:opacity-50 disabled:text-black btn-sm text-red-600" onClick={async () => {
                                        const copy = [...questions];
                                        if (copy[index].type != 'Ranking') {
                                            return;
                                        }
                                        DeleteRankingOption(copy[index].data.rankOptions[i].id);
                                        copy[index].data.rankOptions.splice(i,1);
                                        setQuestions(copy);
                                    }}><RiDeleteBin5Fill size={24} /></button>
                                </div>
                                );
                            })}
                        </div>
                        <button disabled={deleted} type="button" className="flex gap-3 w-fit disabled:opacity-50" onClick={async () => {
                            const copy = [...questions];
                            if (copy[index].type != 'Ranking') {
                                return;
                            }
                            const response = await CreateNewRankingOption(questions[index].data.id, "New Option", copy[index].data.rankOptions.length);
                            if (response == null)
                                return;
                            copy[index].data.rankOptions.push(response);
                            setQuestions(copy);
                        }}><FiPlus size={24} /> Add New Option</button>
                    </div>
                </div>
            </div>
            :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-3 sm:p-6 gap-3 hover:cursor-pointer flex-grow">
                <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
                <div className="flex flex-col gap-3 pl-3">
                    {questions[index].data.rankOptions.sort((a,b) => a.order_index - b.order_index).map((current, index) => {
                        return (
                        <div key={index} className="border-gray-400 border-[2px] rounded-md p-2">
                            <p className="text-md">{current.option}</p>
                        </div>
                        );
                    })}
                </div>
            </div> }
            <div {...provided.dragHandleProps}><RxDragHandleDots2 size={24} className="text-black" /></div>
        </div>
        )
}