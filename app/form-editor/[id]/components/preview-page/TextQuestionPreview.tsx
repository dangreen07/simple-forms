import { question } from "@/server/types";
import TextareaAutosize from 'react-textarea-autosize';

export default function TextQuestionPreview({ questions, index }: { questions: question[], index: number }) {
    if (questions[index].type != "Text") {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <TextareaAutosize className="input input-bordered w-full resize-none p-2" />
        </div>
    )
}