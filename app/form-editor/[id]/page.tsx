import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { FormLoadPage } from "./FormLoadPage";
import { Suspense } from "react";
import FormLoading from "./FormLoading";

export default async function Page({ params }: {params: { id: string } }) {
    return (
        <div className="flex flex-col min-h-screen bg-blue-300">
            <div className="fixed top-0 w-full"><NavigationAnyAccess checkSession={false} background="bg-blue-300" textColor="text-gray-800" /></div>
            <div className="pt-24" />
            <Suspense fallback={<FormLoading />}>
                <FormLoadPage formID={params.id} />
            </Suspense>
        </div>
    )
}