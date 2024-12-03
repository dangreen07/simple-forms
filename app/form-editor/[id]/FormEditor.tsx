"use client";

import { useEffect, useRef, useState } from "react";
import { FaRegCalendarDays, FaRegThumbsUp } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { LuArrowDownUp } from "react-icons/lu";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { PiTextTBold } from "react-icons/pi";
import { question } from "@/server/types";
import { CreateNewChoicesQuestion } from "@/server/choices";
import { UpdateFormTitle } from "@/server/forms";
import { CreateNewTextQuestion } from "@/server/textQuestions";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { CreateNewRatingQuestion } from "@/server/ratings";
import { CreateNewDateQuestion } from "@/server/dates";
import { CreateNewRankingQuestion } from "@/server/rankingQuestions";
import QuestionRenderer from "./components/QuestionRenderer";
import { updateOrderIndex } from "@/functions/updateOrderIndex";
import { useClickOutside } from "@/functions/useClickOutside";

export default function FormEditor({ questions, setQuestions, formName, setFormName, formID }: { questions: question[], setQuestions: React.Dispatch<React.SetStateAction<question[]>>, formName: string, setFormName: React.Dispatch<React.SetStateAction<string>>, formID: string }) {
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
        const updatedQuestions = [...questions.sort((a,b) => a.data.order_index - b.data.order_index)];
        const [ temp ] = updatedQuestions.splice(result.source.index, 1); // Remove it
        const reorderedQuestions = [...updatedQuestions.slice(0, result.destination.index), temp, ...updatedQuestions.slice(result.destination.index)]
        // Reorganise and sync the change to the database
        for (let i = 0; i < reorderedQuestions.length; i++) {
            if (reorderedQuestions[i].data.order_index !== i) {
                updateOrderIndex(reorderedQuestions[i], i);
            }
        }
        setQuestions(reorderedQuestions);
    }

    const addNewQuestion = async (type: string) => {
        const content = document.getElementById("add-new-question-content") as HTMLDivElement;
        content.style.display = "none";
      
        setWaitingForNewQuestionResponse(true);
      
        let response;
        let current: question;
      
        switch (type) {
          case 'Choice':
            response = await CreateNewChoicesQuestion(formID, "Question", ["Option 1", "Option 2"], questions.length);
            if (!response) return; // Handle error
            current = { type: 'Choice', data: response };
            break;
          case 'Text':
            response = await CreateNewTextQuestion(formID, "Question", questions.length);
            if (!response) return; // Handle error
            current = { type: 'Text', data: response };
            break;
          // Handle other cases similarly
          case 'Rating':
            response = await CreateNewRatingQuestion(formID, "Question", questions.length);
            if (!response) return; // Handle error
            current = { type: 'Rating', data: response };
            break;
          case 'Date':
            response = await CreateNewDateQuestion(formID, "Question", questions.length);
            if (!response) return; // Handle error
            current = { type: 'Date', data: response };
            break;
          case 'Ranking':
            response = await CreateNewRankingQuestion(formID, "Question", ["Option 1", "Option 2", "Option 3"], questions.length);
            if (!response) return; // Handle error
            current = { type: 'Ranking', data: response };
            break;
          default:
            return;
        }
      
        setQuestions([...questions, current]);
        setJustCreatedIndex(questions.length);
        setWaitingForNewQuestionResponse(false);
    };

    const resizeTextArea = () => {
        if (titleRef.current) {
            titleRef.current.style.height = "auto";
            titleRef.current.style.height = titleRef.current.scrollHeight + "px";
        }
    }

    useEffect(() => {
        resizeTextArea();
        window.addEventListener("resize", resizeTextArea);
    }, []);

    return (
        <div className="flex justify-center flex-grow">
            <div className="bg-neutral-100 max-w-6xl flex-grow mb-6 rounded-lg">
                <div id="form-content" className="w-full flex flex-col text-black px-2 md:px-12 py-16 gap-2 justify-start">
                    <textarea ref={titleRef} value={formName} onChange={(current) => {
                        setEditingTitle(true);
                        setFormName(current.target.value);
                        resizeTextArea();
                    }} className="resize-none text-3xl sm:text-4xl md:text-5xl font-semibold bg-neutral-100 border-none outline-none w-full" placeholder="Form title here..." />
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided) => (
                                <div
                                    className="flex flex-col gap-2"
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
                                                    <QuestionRenderer
                                                        question={current}
                                                        index={index}
                                                        justCreatedIndex={justCreatedIndex}
                                                        questions={questions}
                                                        setQuestions={setQuestions}
                                                        provided={provided}
                                                    />
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
                            <button className="btn btn-accent rounded-full" onClick={() => addNewQuestion('Choice')}>
                                <span className="flex items-center justify-center">
                                    <MdOutlineRadioButtonChecked size={24} />
                                </span>
                                <span className="font-semibold text-lg hidden sm:block">Choice</span>
                            </button>
                            <button className="btn btn-accent rounded-full" onClick={() => addNewQuestion("Text")}>
                                <span className="flex items-center justify-center">
                                    <PiTextTBold size={24} />
                                </span>
                                <span className="font-semibold text-lg hidden sm:block">Text</span>
                            </button>
                            <button className="btn btn-accent rounded-full" onClick={() => addNewQuestion("Rating")}>
                                <span className="flex items-center justify-center">
                                    <FaRegThumbsUp size={24} />
                                </span>
                                <span className="font-semibold text-lg hidden sm:block">Rating</span>
                            </button>
                            <button className="btn btn-accent rounded-full" onClick={() => addNewQuestion("Date")}>
                                <span className="flex items-center justify-center">
                                    <FaRegCalendarDays size={24} />
                                </span>
                                <span className="font-semibold text-lg hidden sm:block">Date</span>
                            </button>
                            <button className="btn btn-accent rounded-full" onClick={() => addNewQuestion("Ranking")}>
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
    );
}