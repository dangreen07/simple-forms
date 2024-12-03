import { question } from "@/server/types";

export default function RatingQuestionPreview({questions, index}: {questions: question[], index: number}) {
    if (questions[index].type != "Rating") {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <div className="rating">
                {Array(questions[index].data.ratingsLevel).fill(0).map((_, i) => <input type="radio" defaultChecked={i == 0} name={"Rating-" + questions[index].data.id} className="mask mask-star-2 bg-amber-500" key={i} />)}
            </div>
        </div>
    );
}