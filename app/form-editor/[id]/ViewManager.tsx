"use client";

import { useState } from "react";
import FormEditor from "./FormEditor";
import { question } from "@/server/types";
import TopBar from "./components/TopBar";
import dynamic from "next/dynamic";

const DynamicFormPreview = dynamic(() => import("./FormPreview"));

export default function ViewManager({ initialFormName, initialQuestions, formID }: {
    initialFormName: string;
    initialQuestions: question[];
    formID: string;
}) {
    const [formName, setFormName] = useState(initialFormName);
    const [questions, setQuestions] = useState<question[]>(initialQuestions);

    // Need to base the editor value on the URL params
    const [editor, setEditor] = useState(true);
    return (
        <div className="flex flex-col flex-grow">
            <TopBar formID={formID} setEditor={setEditor} editor={editor} />
            {editor ?
            <FormEditor
                questions={questions}
                setQuestions={setQuestions}
                formName={formName}
                setFormName={setFormName}
                formID={formID} /> :
            <DynamicFormPreview
                questions={questions}
                formName={formName} />}
        </div>
    )
}