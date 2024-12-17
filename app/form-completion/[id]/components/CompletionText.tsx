import TextView from "@/components/questions/TextView";
import { clientResponse, question } from "@/server/types";
import { ChangeEvent } from "react";

export default function CompletionText({ questions, index, responses, setResponses }: { questions: question[], index: number, responses: clientResponse[], setResponses: React.Dispatch<React.SetStateAction<clientResponse[]>> }) {
    function handleChange(current: ChangeEvent<HTMLTextAreaElement>): void {
        const copy = [...responses];
        const currentIndex = copy.findIndex((item) => item.questionID == questions[index].data.id && item.questionType == "Text");
        if (currentIndex == -1) {
            copy.push({ questionType: "Text", questionID: questions[index].data.id, response: current.target.value });
        }
        else {
            copy[currentIndex].response = current.target.value;
        }
        setResponses(copy);
    }

    return <TextView questions={questions} index={index} handleChange={handleChange} />
}