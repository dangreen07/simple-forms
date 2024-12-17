"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { question } from "@/server/types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";

export default function DateView({questions, index, date, handleChange}: {questions: question[], index: number, date: Date | undefined, handleChange: (current: Date | undefined) => void}) {
    if (questions[index].type != "Date") {
        return <div>Invalid question type</div>
    }

    return (
        <div className="flex flex-col gap-2 items-start">
            <p className="text-xl font-semibold">{questions[index].data.questionText}</p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        >
                            <CalendarIcon />
                            { date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleChange}
                    initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}