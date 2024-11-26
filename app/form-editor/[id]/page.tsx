import { GetFormData } from "@/server/forms";
import FormEditor from "./FormEditor";
import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { question } from "@/server/types";

export default async function Page({ params }: {params: { id: string } }) {
    let formName = "";
    let questions: question[] = [];
    if (params.id != "new") {
        const data = await GetFormData(Number(params.id));
        if (data == null) {
            // Invalid credentials or the form doesn't exist
        }
        else {
            formName = data.formName;
            questions = data.questions;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
            <div className="fixed top-0 w-full"><NavigationAnyAccess /></div>
            <div className="pt-24"></div>
            <FormEditor initialFormName={formName} initialQuestions={questions} />
        </div>
    )
}