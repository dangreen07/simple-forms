import { GetFormData } from "@/server/forms";
import FormEditor from "./FormEditor";
import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { question } from "@/server/types";

export default async function Page({ params }: {params: { id: string } }) {
    let formName = "";
    let questions: question[] = [];
    const data = await GetFormData(Number(params.id));
    if (data == null) {
        // Invalid credentials or the form doesn't exist
    }
    else {
        formName = data.formName;
        questions = data.questions;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="fixed top-0 w-full"><NavigationAnyAccess checkSession={false} background="bg-blue-300" textColor="text-gray-800" /></div>
            <div className="pt-24"></div>
            <div className="flex flex-grow bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
            <FormEditor initialFormName={formName} initialQuestions={questions} formID={Number(params.id)} />
            </div>
        </div>
    )
}