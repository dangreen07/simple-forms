"use client";

import RankingView from "@/components/questions/RankingView";
import { question, RankOptionData } from "@/server/types";
import { DropResult } from "@hello-pangea/dnd";
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
    return <RankingView questions={questions} index={index} onDragEnd={onDragEnd} response={response} />
}