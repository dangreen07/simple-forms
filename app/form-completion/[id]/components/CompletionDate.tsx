import DateView from "@/components/questions/DateView";
import { clientResponse, question } from "@/server/types";
import React, { useState } from "react";

export default function CompletionDate({ questions, index, responses, setResponses }: { questions: question[], index: number, responses: clientResponse[], setResponses: React.Dispatch<React.SetStateAction<clientResponse[]>> }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    function handleChange(current: Date | undefined): void {
        setDate(current);
        if (current == undefined) return;
        const copy = [...responses];
        const currentIndex = copy.findIndex((item) => item.questionID == questions[index].data.id && item.questionType == "Date");
        if (currentIndex == -1) {
            copy.push({ questionType: "Date", questionID: questions[index].data.id, response: current });
        }
        else {
            copy[currentIndex].response = current.toISOString();
        }
        setResponses(copy);
    }

    return <DateView questions={questions} index={index} date={date} handleChange={handleChange} />
}