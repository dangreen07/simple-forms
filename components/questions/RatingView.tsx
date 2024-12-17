"use client";

import { question } from "@/server/types";
import { ChangeEvent } from "react";

export default function RatingView({ questions, index, handleChange = () => {} }: { questions: question[], index: number, handleChange?: (current: ChangeEvent<HTMLInputElement>, i: number) => void }) {
    if (questions[index].type != "Rating") {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <div className="rating">
                {Array(questions[index].data.ratingsLevel).fill(0).map((_, i) => <input onChange={(current) => handleChange(current, i)} type="radio" defaultChecked={i == 0} name={"Rating-" + questions[index].data.id} className="mask mask-star-2 bg-amber-500" key={i} />)}
            </div>
        </div>
    );
}