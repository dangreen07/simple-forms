"use client";

import { useRef, useState } from "react";
import { FaRegCalendarDays, FaRegThumbsUp } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { LuArrowDownUp } from "react-icons/lu";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { PiTextTBold } from "react-icons/pi";
import ChoiceCreation, { useClickOutside } from "./ChoiceCreation";
import { question } from "@/server/types";
import { CreateNewChoicesQuestion, UpdateChoiceOrderIndex } from "@/server/choices";
import { UpdateFormTitle } from "@/server/forms";
import TextQuestionCreation from "./TextQuestionCreation";
import { CreateNewTextQuestion, UpdateTextQuestionOrderIndex } from "@/server/textQuestions";

export default function FormEditor({ initialFormName, initialQuestions, formID }: { initialFormName: string, initialQuestions: question[], formID: number }) {
    const [formName, setFormName] = useState(initialFormName);
    const [questions, setQuestions] = useState<question[]>(initialQuestions);
    const [justCreatedIndex, setJustCreatedIndex] = useState(-1);
    const titleRef = useRef<HTMLInputElement | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [waitingForNewQuestionResponse, setWaitingForNewQuestionResponse] = useState(false);

    async function saveTitleToDatabase() {
        if (editingTitle) {
            await UpdateFormTitle(formID, formName);
        }
        setEditingTitle(false);
    }

    useClickOutside(titleRef, saveTitleToDatabase);

    return (
        <div className="flex flex-col flex-grow">
            <div className="flex h-full flex-grow justify-center">
                <div className="bg-neutral-100 max-w-6xl flex-grow my-6 rounded-lg">
                    <div id="form-content" className="w-full flex flex-col text-black px-2 sm:px-12 py-16 gap-4">
                        <input ref={titleRef} value={formName} onChange={(current) => {
                            setEditingTitle(true);
                            setFormName(current.target.value);
                        }} className="text-3xl sm:text-5xl font-semibold bg-neutral-100 border-none outline-none" placeholder="Form title here..." />
                        {questions.sort((a,b) => a.data.order_index - b.data.order_index).map((current, index) => {
                            if (current.type == "Choice") {
                                if (current.data.order_index != index) {
                                    questions[index].data.order_index = index;
                                    // Update the database
                                    UpdateChoiceOrderIndex(current.data.choiceId, index);
                                }
                                return (
                                    <ChoiceCreation key={index}
                                        questions={questions}
                                        setQuestions={setQuestions}
                                        index={index}
                                        justCreated={index == justCreatedIndex}
                                        choiceID={current.data.choiceId}
                                    />
                                );
                            }
                            else if (current.type == 'Text') {
                                if (questions[index].data.order_index != index) {
                                    questions[index].data.order_index = index;
                                    UpdateTextQuestionOrderIndex(current.data.textId, index);
                                }
                                return (
                                    <TextQuestionCreation
                                        key={index} 
                                        questions={questions}
                                        setQuestions={setQuestions}
                                        index={index}
                                        justCreated={index == justCreatedIndex}
                                    />
                                )
                            }
                        })}
                        <div id="add-new-question" className="flex flex-col gap-4">
                            <button disabled={waitingForNewQuestionResponse} id="add-new-question-button" className="w-fit flex items-center gap-2" type="button" onClick={() => {
                                const content = document.getElementById("add-new-question-content") as HTMLDivElement;
                                if (content.style.display === "grid") {
                                    content.style.display = "none";
                                } else {
                                    content.style.display = "grid";
                                    window.scrollTo({
                                        top: document.body.scrollHeight,
                                        left: 0,
                                        behavior: 'smooth'
                                    });
                                }
                            }}>
                                <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-content">
                                    <FiPlus size={28} />
                                </span>
                                <span className="text-primary font-bold">Add new question</span>
                            </button>
                            <div id="add-new-question-content" className="px-3 duration-200 hidden gap-4 grid-cols-3">
                                <button className="btn btn-accent rounded-full" onClick={async () => {
                                    const content = document.getElementById("add-new-question-content") as HTMLDivElement;
                                    if (content.style.display === "grid") {
                                        content.style.display = "none";
                                    } else {
                                        content.style.display = "grid";
                                    }
                                    const copy = [...questions];
                                    setWaitingForNewQuestionResponse(true);
                                    const response = await CreateNewChoicesQuestion(formID, "Question", ["Option 1", "Option 2"], questions.length);
                                    if (response == null)
                                        // Give error to the user
                                        return;
                                    const current: question = {
                                        type: "Choice",
                                        data: {
                                            choiceId: response.choicesID,
                                            questionText: "Question",
                                            options: response.options,
                                            editMode: true,
                                            order_index: response.orderIndex
                                        }
                                    };
                                    copy.push(current);
                                    setQuestions(copy);
                                    setJustCreatedIndex(copy.length - 1);
                                    setWaitingForNewQuestionResponse(false);
                                }}>
                                    <span className="flex items-center justify-center">
                                        <MdOutlineRadioButtonChecked size={24} />
                                    </span>
                                    <span className="font-semibold text-lg">Choice</span>
                                </button>
                                <button className="btn btn-accent rounded-full" onClick={async () => {
                                    const content = document.getElementById("add-new-question-content") as HTMLDivElement;
                                    if (content.style.display === "grid") {
                                        content.style.display = "none";
                                    } else {
                                        content.style.display = "grid";
                                    }
                                    const copy = [...questions];
                                    setWaitingForNewQuestionResponse(true);
                                    const response = await CreateNewTextQuestion(formID, "Question", questions.length);
                                    if (response == null) {
                                        // Give error to the user
                                        return;
                                    }
                                    const current: question = {
                                        type: 'Text',
                                        data: response
                                    };
                                    copy.push(current);
                                    setQuestions(copy);
                                    setJustCreatedIndex(copy.length - 1);
                                    setWaitingForNewQuestionResponse(false);
                                }}>
                                    <span className="flex items-center justify-center">
                                        <PiTextTBold size={24} />
                                    </span>
                                    <span className="font-semibold text-lg">Text</span>
                                </button>
                                <button className="btn btn-accent rounded-full ">
                                    <span className="flex items-center justify-center">
                                        <FaRegThumbsUp size={24} />
                                    </span>
                                    <span className="font-semibold text-lg">Rating</span>
                                </button>
                                <button className="btn btn-accent rounded-full ">
                                    <span className="flex items-center justify-center">
                                        <FaRegCalendarDays size={24} />
                                    </span>
                                    <span className="font-semibold text-lg">Date</span>
                                </button>
                                <button className="btn btn-accent rounded-full ">
                                    <span className="flex items-center justify-center">
                                        <LuArrowDownUp size={24} />
                                    </span>
                                    <span className="font-semibold text-lg">Ranking</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}