import { question } from "@/server/types";

export default function RatingQuestionForm({ questions, index }: { questions: question[], index: number }) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
            
        </div>
    )
}