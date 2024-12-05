"use server";

import ViewManager from "./ViewManager";
import { GetFormData } from "@/server/forms";

export async function FormLoadPage({ formID }: { formID: string }) {
    const data = await GetFormData(formID);
    if (data == null) {
        // Invalid credentials or the form doesn't exist
        return <div>Invalid form ID</div>;
    }
    
    return (
        <div className="flex flex-grow bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
            <ViewManager initialFormName={data.formName} initialQuestions={data.questions} formID={formID} />
        </div>
    )
}