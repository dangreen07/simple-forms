"use client";

import { CreateNewChoiceOption, DeleteChoice, DeleteChoiceOption, UpdateChoiceQuestion } from "@/server/choices";
import { question } from "@/server/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import TextareaAutosize from 'react-textarea-autosize';

export default function ChoiceQuestionComponent({ questions, setQuestions, index, justCreated, choiceID }: {  questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number, justCreated: boolean, choiceID: number }) {
    const [editMode, setEditMode] = useState(justCreated);
    const [deleted, setDeleted] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    async function deleteCallback() {
        if (questions[index].type == 'Choice') {
            const copy = [...questions];
            copy.splice(index, 1);
            // Disable input until the deletion in the database is confirmed
            setDeleted(true);
            await DeleteChoice(choiceID);
            setQuestions(copy);
            setDeleted(false);
        }
    }

    function editModeSetFalse() {
        if (editMode != false && !deleted) {
            setEditMode(false);
            if (questions[index].type == 'Choice') {
                UpdateChoiceQuestion(choiceID, questions[index].data.questionText, questions[index].data.options, questions[index].data.order_index);
            }
        }
    }

    useClickOutside(ref, editModeSetFalse);

    // Mainly for the error checking, won't happen if all runs well
    if (questions[index].type != "Choice") {
        return <div></div>
    }

    return (
        <div ref={ref} id={`choice-${choiceID}`} onClick={() => setEditMode(true)}>
            { editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-3 pb-2">
                {/* We are in the edit mode here */}
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
                            const response = await CreateNewChoiceOption(choiceID, "", copy[index].data.options.length);
                            if (response == null)
                                return;
                            copy[index].data.options.push(response);
                            setQuestions(copy);
                        }}><FiPlus size={24} /> Add New Option</button>
                    </div>
                </div>
            </div> :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-6 gap-3 hover:cursor-pointer">
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
        </div>
    );
}

export const useClickOutside = (
  ref: RefObject<HTMLElement | undefined>,
  callback: () => void
) => {
  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}