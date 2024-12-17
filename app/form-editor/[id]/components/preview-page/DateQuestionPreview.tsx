"use client";

import DateView from "@/components/questions/DateView";
import { question } from "@/server/types";
import React, { useState } from "react";

export default function DateQuestionPreview({questions, index}: {questions: question[], index: number}) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return <DateView questions={questions} index={index} date={date} handleChange={setDate} />
}