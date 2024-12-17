"use client";

import RankingView from "@/components/questions/RankingView";
import { clientResponse, question, RankOptionData } from "@/server/types";
import { DropResult } from "@hello-pangea/dnd";
import { useState } from "react";

export default function CompletionRanking({ questions, index, responses, setResponses }: { questions: question[], index: number, responses: clientResponse[], setResponses: React.Dispatch<React.SetStateAction<clientResponse[]>> }) {
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
        const copy = [...responses];
        const currentIndex = copy.findIndex((item) => item.questionID == questions[index].data.id && item.questionType == "Ranking");
        if (currentIndex == -1) {
            copy.push({ questionType: "Ranking", questionID: questions[index].data.id, response: reorderedRankings2.map((item) => item.id) });
        }
        else {
            copy[currentIndex].response = reorderedRankings2.map((item) => item.id);
        }
        setResponses(copy);
        setResponse(reorderedRankings2);
    }
    return <RankingView questions={questions} index={index} onDragEnd={onDragEnd} response={response} />
}