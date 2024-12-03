"use client";

import { question, RankOptionData } from "@/server/types";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { useState } from "react";

export default function RankingQuestionPreview({ questions, index }: { questions: question[], index: number }) {
    const [response, setResponse] = useState<RankOptionData[]>(questions[index].type == "Ranking" ? questions[index].data.rankOptions : []);

    function onDragEnd(result: DropResult) {
        // dropped outside the list
        if (!result.destination) {
            console.log("Invalid location!");
            return;
        }
        if (questions[index].type != "Ranking") {
            return;
        }
        const reorderedRankings = [...response];
        const [ temp ] = reorderedRankings.splice(result.source.index, 1); // Remove it
        const reorderedRankings2 = [...reorderedRankings.slice(0, result.destination.index), temp, ...reorderedRankings.slice(result.destination.index)]
        setResponse(reorderedRankings2);
    }
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <div className="flex flex-col gap-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-2">
                        {(provided) => (
                            <div
                                className="flex flex-col gap-2"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {response.map((current, i) => {
                                    return (
                                    <Draggable key={`${current.id}-${i}`} draggableId={`${current.id}-${i}`} index={i}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <div className="p-2 rounded-lg border-2 border-gray-300 bg-neutral-200">
                                                    <p className="text-lg">{current.option}</p>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>);
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}