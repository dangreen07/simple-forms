import { GetFormData } from "@/server/forms";
import FormEditor from "./FormEditor";
import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import TopBar from "./components/TopBar";

export default async function Page({ params }: {params: { id: string } }) {
    const data = await GetFormData(params.id);
    if (data == null) {
        // Invalid credentials or the form doesn't exist
        return <div>Invalid form ID</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-blue-300">
            <div className="fixed top-0 w-full"><NavigationAnyAccess checkSession={false} background="bg-blue-300" textColor="text-gray-800" /></div>
            <div className="pt-24" />
            <div className="flex flex-grow bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
                <div className="flex flex-col flex-grow">
                    <TopBar formID={params.id} />
                    <FormEditor initialFormName={data.formName} initialQuestions={data.questions} formID={params.id} />
                </div>
            </div>
        </div>
    )
}