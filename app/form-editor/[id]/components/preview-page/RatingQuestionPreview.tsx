import RatingView from "@/components/questions/RatingView";
import { question } from "@/server/types";

export default function RatingQuestionPreview({questions, index}: {questions: question[], index: number}) {
    return <RatingView questions={questions} index={index} />
}