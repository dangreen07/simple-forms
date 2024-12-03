import { question } from "@/server/types";

export default function ChoiceQuestionPreview({ questions, index }: { questions: question[], index: number }) {
    if (questions[index].type != "Choice") {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <div className="flex flex-col gap-2">
                {questions[index].data.options.map((choice, i) => <div key={i} className="flex flex-row gap-2">
                    <input type="radio" name={"Choice-" + questions[index].data.id} value={choice.id} id={"Choice-"+choice.id.toString()} className="radio" />
                    <label htmlFor={"Choice-"+choice.id.toString()} className="text-lg">{choice.option}</label>
                </div>)}
            </div>
        </div>
        
    )
}