"use client";

import { question, RankOptionData } from "@/server/types";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";

export default function RankingView({ questions, index, onDragEnd, response }: { questions: question[], index: number, onDragEnd: (result: DropResult) => void, response: RankOptionData[] }) {
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