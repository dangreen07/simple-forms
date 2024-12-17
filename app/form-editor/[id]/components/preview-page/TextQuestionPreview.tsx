import TextView from "@/components/questions/TextView";
import { question } from "@/server/types";

export default function TextQuestionPreview({ questions, index }: { questions: question[], index: number }) {
    return <TextView questions={questions} index={index} />
}