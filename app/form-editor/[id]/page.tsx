import { GetFormName } from "@/server/forms";
import FormEditor from "./FormEditor";
import NavigationAnyAccess from "@/components/NavigationAnyAccess";

export default async function Page({ params }: {params: { id: string } }) {
    let formName = "";
    if (params.id != "new") {
        formName = await GetFormName(params.id);
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-300 to-red-300 bg-fixed">
            <div className="fixed top-0 w-full"><NavigationAnyAccess /></div>
            <div className="pt-24"></div>
            <FormEditor initialFormName={formName} />
        </div>
    )
}