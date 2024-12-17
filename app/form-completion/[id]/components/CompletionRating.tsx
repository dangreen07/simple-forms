import RatingView from "@/components/questions/RatingView";
import { clientResponse, question } from "@/server/types";
import { ChangeEvent, useState } from "react";

export default function CompletionRating({ questions, index, responses, setResponses }: { questions: question[], index: number, responses: clientResponse[], setResponses: React.Dispatch<React.SetStateAction<clientResponse[]>> }) {
    const [ratings, setRatings] = useState<boolean[]>(Array(questions[index].type == "Rating" ? questions[index].data.ratingsLevel : 2).fill(false));

    function handleChange(current: ChangeEvent<HTMLInputElement>, i: number): void {
        const temp = [...ratings];
        temp[i] = current.target.checked;
        setRatings(temp);

        const copy = [...responses];
        const currentIndex = copy.findIndex((item) => item.questionID == questions[index].data.id && item.questionType == "Rating");
        if (currentIndex == -1) {
            copy.push({ questionType: "Rating", questionID: questions[index].data.id, response: ratings.reduce((_,b) => b ? 1 : 0, 0) });
        }
        else {
            copy[currentIndex].response = current.target.value;
        }
        setResponses(copy);
    }

    return <RatingView questions={questions} index={index} handleChange={handleChange} />
}