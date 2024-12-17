import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { GetFormData } from "@/server/forms";
import FormCompletion from "./FormCompletion";

export default async function Page({ params }: { params: { id: string } }) {
    const data = await GetFormData(params.id);

    if (data == null) {
        return <div>Form not found</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-300 to-green-300 bg-fixed flex flex-col justify-center">
            <NavigationAnyAccess background={"bg-blue-300"} textColor={"text-black"} />
            <div className="mx-auto max-w-6xl p-8 w-full h-full flex-grow bg-neutral-50 rounded-xl mb-8">
                <h1 className="text-5xl font-semibold py-4">{data?.formName}</h1>
                <FormCompletion questions={data.questions} formID={params.id} />
            </div>
        </div>
    )
}