import ChoiceView from "@/components/questions/ChoiceView";
import { question } from "@/server/types";

export default function ChoiceQuestionPreview({ questions, index }: { questions: question[], index: number }) {
    return <ChoiceView questions={questions} index={index} />
}