"use client";

import { question } from "@/server/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdOutlineRadioButtonChecked, MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";

export default function ChoiceCreation({ deleteMeCallback, questions, setQuestions, index, justCreated }: { deleteMeCallback: () => void, questions: question[], setQuestions: Dispatch<SetStateAction<question[]>>, index: number, justCreated: boolean }) {
    const [editMode, setEditMode] = useState(justCreated);
    const ref = useRef<HTMLDivElement | null>(null);

    function editModeSetFalse() {
        setEditMode(false);
    }

    useClickOutside(ref, editModeSetFalse);

    // Mainly for the error checking, won't happen if all runs well
    if (questions[index].type != "Choice") {
        return <div></div>
    }

    return (
        <div ref={ref} onClick={() => setEditMode(true)}>
            { editMode ?
            <div className="flex flex-col bg-neutral-200 rounded-lg px-3 pb-2">
                {/* We are in the edit mode here */}
                <div className="flex w-full flex-grow justify-end py-2">
                    <button className="btn btn-ghost btn-circle btn-sm" type="button" onClick={deleteMeCallback}><RiDeleteBin5Fill size={24} /></button>
                </div>
                <div className="flex gap-2">
                    <p className="text-xl font-bold py-1">{index + 1}.</p>
                    <div className="flex flex-col gap-3 flex-grow">
                        <input type="text" className="outline-none border-none bg-neutral-100 p-2 rounded-md" placeholder="Enter your question here..." value={questions[index].data.questionText} onChange={(current) => {
                            const copy = [...questions];
                            copy[index].data.questionText = current.target.value;
                            setQuestions(copy);
                        }} />
                        {questions[index].data.options.map((item, i) => {
                            return (
                                <div key={i} className="flex gap-3 items-center">
                                    <span className="flex items-center justify-center">
                                        <MdOutlineRadioButtonChecked size={24} />
                                    </span>
                                    <input type="text" className="outline-none border-none bg-neutral-100 p-2 rounded-md" value={item} onChange={(current) => {
                                        const copy = [...questions];
                                        if (copy[index].type != "Choice") {
                                            return;
                                        }
                                        copy[index].data.options[i] = current.target.value;
                                        setQuestions(copy);
                                    }} />
                                    <button className="btn btn-ghost btn-circle btn-sm text-red-600" type="button" onClick={() => {
                                        const copy = [...questions];
                                        if (copy[index].type != "Choice") {
                                            return;
                                        }
                                        copy[index].data.options.splice(i,1);
                                        setQuestions(copy);
                                    }}><RiDeleteBin5Fill size={24} /></button>
                                </div>
                            )
                        })}
                        <button type="button" className="flex gap-3 w-fit" onClick={() => {
                            const copy = [...questions];
                            if (copy[index].type != "Choice") {
                                return;
                            }
                            copy[index].data.options.push("");
                            setQuestions(copy);
                        }}><FiPlus size={24} /> Add New Option</button>
                    </div>
                </div>
            </div> :
            <div className="flex flex-col hover:bg-neutral-200 bg-neutral-100 rounded-lg p-6 gap-3">
                <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
                <div className="flex flex-col gap-3">
                    {questions[index].data.options.map((item, index) => {
                        return (
                            <div key={index} className="flex px-5 gap-2 items-center">
                                <span className="flex items-center justify-center">
                                    <MdOutlineRadioButtonUnchecked size={24} />
                                </span>
                                <p className="font-semibold">{item}</p>
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