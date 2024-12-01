"use client";

import { useRef, useState } from "react";
import { FaRegCalendarDays, FaRegThumbsUp } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { LuArrowDownUp } from "react-icons/lu";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { PiTextTBold } from "react-icons/pi";
import { question } from "@/server/types";
import { CreateNewChoicesQuestion, UpdateChoiceOrderIndex } from "@/server/choices";
import { UpdateFormTitle } from "@/server/forms";
import TextQuestionCreation from "./TextQuestionCreation";
import { CreateNewTextQuestion, UpdateTextQuestionOrderIndex } from "@/server/textQuestions";
import ChoiceQuestionComponent, { useClickOutside } from "./ChoiceQuestionComponent";
import { DragDropContext, Draggable, DraggableProvided, Droppable, DropResult } from "@hello-pangea/dnd";
import RatingQuestionComponent from "./RatingQuestionComponent";
import { CreateNewRatingQuestion, UpdateRatingQuestionOrderIndex } from "@/server/ratings";
import TextareaAutosize from 'react-textarea-autosize';
import DateQuestionComponent from "./DateQuestionComponent";
import { CreateNewDateQuestion, UpdateDateQuestionOrderIndex } from "@/server/dates";
import RankingQuestionComponent from "./RankingQuestionComponent";
import { CreateNewRankingQuestion, UpdateRankingQuestionOrderIndex } from "@/server/rankingQuestions";

export default function FormEditor({ initialFormName, initialQuestions, formID }: { initialFormName: string, initialQuestions: question[], formID: number }) {
    const [formName, setFormName] = useState(initialFormName);
    const [questions, setQuestions] = useState<question[]>(initialQuestions);
    const [justCreatedIndex, setJustCreatedIndex] = useState(-1);
    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [waitingForNewQuestionResponse, setWaitingForNewQuestionResponse] = useState(false);

    async function saveTitleToDatabase() {
        if (editingTitle) {
            await UpdateFormTitle(formID, formName);
        }
        setEditingTitle(false);
    }

    useClickOutside(titleRef, saveTitleToDatabase);

    function onDragEnd(result: DropResult) {
        // dropped outside the list
        if (!result.destination) {
            console.log("Invalid location!");
            return;
        }

        const copy = [...questions.sort((a,b) => a.data.order_index - b.data.order_index)];
        const [ temp ] = copy.splice(result.source.index, 1); // Remove it
        const copy2 = [...copy.slice(0, result.destination.index), temp, ...copy.slice(result.destination.index)]
        // Reorganise and sync the change to the database
        for (let i = 0; i < copy2.length; i++) {
            if (copy2[i].data.order_index != i) {
                if (copy2[i].type == 'Choice') {
                    copy2[i].data.order_index = i;
                    // Update the database
                    UpdateChoiceOrderIndex(copy2[i].data.id, i);
                }
                else if (copy2[i].type == "Text") {
                    copy2[i].data.order_index = i;
                    UpdateTextQuestionOrderIndex(copy2[i].data.id, i);
                }
                else if (copy2[i].type == "Rating") {
                    copy2[i].data.order_index = i;
                    UpdateRatingQuestionOrderIndex(copy2[i].data.id, i);
                }
                else if (copy2[i].type == "Date") {
                    copy2[i].data.order_index = i;
                    UpdateDateQuestionOrderIndex(copy2[i].data.id, i);
                }
                else if (copy2[i].type == "Ranking") {
                    copy2[i].data.order_index = i;
                    UpdateRankingQuestionOrderIndex(copy2[i].data.id, i);
                }
            }
        }
        setQuestions(copy2);
    }

    function outputQuestion(current: question, index: number, provided: DraggableProvided) {
        if (current.type == "Choice") {
            if (current.data.order_index != index) {
                const copy = [...questions];
                copy[index].data.order_index = index;
                setQuestions(copy);
                // Update the database
                UpdateChoiceOrderIndex(current.data.id, index);
            }
            return (
                <ChoiceQuestionComponent key={index}
                    questions={questions}
                    setQuestions={setQuestions}
                    index={index}
                    justCreated={index == justCreatedIndex}
                    provided={provided}
                />
            );
        }
        else if (current.type == 'Text') {
            if (questions[index].data.order_index != index) {
                const copy = [...questions];
                copy[index].data.order_index = index;
                setQuestions(copy);
                UpdateTextQuestionOrderIndex(current.data.id, index);
            }
            return (
                <TextQuestionCreation
                    key={index} 
                    questions={questions}
                    setQuestions={setQuestions}
                    index={index}
                    justCreated={index == justCreatedIndex}
                    provided={provided}
                />
            )
        }
        else if (current.type == "Rating") {
            if (questions[index].data.order_index != index) {
                const copy = [...questions];
                copy[index].data.order_index = index;
                setQuestions(copy);
                UpdateRatingQuestionOrderIndex(current.data.id, index);
            }
            return (
                <RatingQuestionComponent
                    key={index}
                    questions={questions}
                    setQuestions={setQuestions}
                    index={index}
                    justCreated={index == justCreatedIndex}
                    provided={provided}
                />
            );
        }
        else if (current.type == "Date") {
            if (questions[index].data.order_index != index) {
                const copy = [...questions];
                copy[index].data.order_index = index;
                setQuestions(copy);
                UpdateDateQuestionOrderIndex(current.data.id, index);
            }
            return (
                <DateQuestionComponent
                    key={index}
                    questions={questions}
                    setQuestions={setQuestions}
                    index={index}
                    justCreated={index == justCreatedIndex}
                    provided={provided}
                />
            );
        }
        else if (current.type == "Ranking") {
            if (questions[index].data.order_index != index) {
                const copy = [...questions];
                copy[index].data.order_index = index;
                setQuestions(copy);
                UpdateRankingQuestionOrderIndex(current.data.id, index);
            }
            return (
                <RankingQuestionComponent
                    key={index}
                    questions={questions}
                    setQuestions={setQuestions}
                    index={index}
                    justCreated={index == justCreatedIndex}
                    provided={provided}
                />
            );
        }
    }

    return (
        <div className="flex flex-col flex-grow">
            <div className="flex h-full flex-grow justify-center">
                <div className="bg-neutral-100 max-w-6xl flex-grow my-6 rounded-lg">
                    <div id="form-content" className="w-full flex flex-col text-black px-2 md:px-12 py-16 gap-4">
                        <TextareaAutosize ref={titleRef} value={formName} onChange={(current) => {
                            setEditingTitle(true);
                            setFormName(current.target.value);
                        }} className="resize-none text-3xl sm:text-4xl md:text-5xl font-semibold bg-neutral-100 border-none outline-none w-full" placeholder="Form title here..." />
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                    <div
                                        className="flex flex-col gap-4"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {questions.sort((a,b) => a.data.order_index - b.data.order_index).map((current, index) => (
                                            <Draggable key={`${current.type}-${current.data.id}`} draggableId={`${current.type}-${current.data.id}`} index={index}>
                                                {(provided) => (
                                                    <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    >
                                                        {outputQuestion(current,index, provided)}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <div id="add-new-question" className="flex flex-col gap-4 px-4">
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
                                <span className="h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center text-primary-content">
                                    <FiPlus size={28} />
                                </span>
                                <span className="text-blue-700 font-bold">Add new question</span>
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
                                            id: response.id,
                                            questionText: "Question",
                                            options: response.options,
                                            editMode: true,
                                            order_index: response.order_index,
                                            required: response.required
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
                                    <span className="font-semibold text-lg hidden sm:block">Choice</span>
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
                                    <span className="font-semibold text-lg hidden sm:block">Text</span>
                                </button>
                                <button className="btn btn-accent rounded-full" onClick={async() => {
                                    const content = document.getElementById("add-new-question-content") as HTMLDivElement;
                                    if (content.style.display === "grid") {
                                        content.style.display = "none";
                                    } else {
                                        content.style.display = "grid";
                                    }
                                    const copy = [...questions];
                                    setWaitingForNewQuestionResponse(true);
                                    const response = await CreateNewRatingQuestion(formID, "Question", questions.length);
                                    if (response == null) {
                                        // Give error to the user
                                        return;
                                    }
                                    const current: question = {
                                        type: "Rating",
                                        data: response
                                    };
                                    copy.push(current);
                                    setQuestions(copy);
                                    setJustCreatedIndex(copy.length - 1);
                                    setWaitingForNewQuestionResponse(false);
                                }}>
                                    <span className="flex items-center justify-center">
                                        <FaRegThumbsUp size={24} />
                                    </span>
                                    <span className="font-semibold text-lg hidden sm:block">Rating</span>
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
                                    const response = await CreateNewDateQuestion(formID, "Question", questions.length);
                                    if (response == null) {
                                        // Give error to the user
                                        return;
                                    }
                                    const current: question = {
                                        type: "Date",
                                        data: response
                                    };
                                    copy.push(current);
                                    setQuestions(copy);
                                    setJustCreatedIndex(copy.length - 1);
                                    setWaitingForNewQuestionResponse(false);
                                }}>
                                    <span className="flex items-center justify-center">
                                        <FaRegCalendarDays size={24} />
                                    </span>
                                    <span className="font-semibold text-lg hidden sm:block">Date</span>
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
                                    const response = await CreateNewRankingQuestion(formID, "Question", ["Option 1", "Option 2", "Option 3"], questions.length);
                                    if (response == null) {
                                        // Give error to the user
                                        return;
                                    }
                                    const current: question = {
                                        type: "Ranking",
                                        data: response
                                    };
                                    copy.push(current);
                                    setQuestions(copy);
                                    setJustCreatedIndex(copy.length - 1);
                                    setWaitingForNewQuestionResponse(false);
                                }}>
                                    <span className="flex items-center justify-center">
                                        <LuArrowDownUp size={24} />
                                    </span>
                                    <span className="font-semibold text-lg hidden sm:block">Ranking</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}