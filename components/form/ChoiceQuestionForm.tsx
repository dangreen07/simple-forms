import { question } from "@/server/types";

export default function ChoiceQuestionForm({ questions, index }: { questions: question[], index: number }) {
    if (questions[index].type != "Choice") {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-lg font-bold">{index + 1}. {questions[index].data.questionText}</p>
            {questions[index].data.options.length > 1 &&
                <div className="flex flex-col gap-2 pl-4">
                    {questions[index].data.options.map((current, i) => {
                        return (
                            <div key={i} className="flex gap-2 items-center">
                                <input type="radio" name={"Choice-" + index} className="radio" defaultChecked={i == 0} />
                                <span className="font-semibold text-lg">{current.option}</span>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}