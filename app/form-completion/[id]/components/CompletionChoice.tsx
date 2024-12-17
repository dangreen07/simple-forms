import ChoiceView from "@/components/questions/ChoiceView";
import { clientResponse, question } from "@/server/types";
import { ChangeEvent } from "react";

export default function CompletionChoice({ questions, index, responses, setResponses }: { questions: question[], index: number, responses: clientResponse[], setResponses: React.Dispatch<React.SetStateAction<clientResponse[]>> }) {
    function handleChange(current: ChangeEvent<HTMLInputElement>): void {
        const copy = [...responses];
        const currentIndex = copy.findIndex((item) => item.questionID == questions[index].data.id && item.questionType == "Choice");
        if (currentIndex == -1) {
            copy.push({ questionType: "Choice", questionID: questions[index].data.id, response: Number(current.target.value) });
        }
        else {
            copy[currentIndex].response = Number(current.target.value);
        }
        setResponses(copy);
    }

    return <ChoiceView questions={questions} index={index} handleChange={handleChange} />
}