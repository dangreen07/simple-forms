import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { GetForms } from "@/server/forms";
import YourForms from "./YourForms";

export default async function Page() {
    // Fetch the form data from the database
    const forms = await GetForms();

    return (
        <div className="bg-neutral-100 min-h-screen">
            <NavigationAnyAccess checkSession={false} />
            <YourForms forms={forms} />
        </div>
    )
}