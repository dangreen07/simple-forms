"use client";

import { CreateNewForm } from "@/server/forms";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

export default function NewFormCreateButton() {
    const router = useRouter();

    return (
        <button onClick={async () => {
            const newFormID = await CreateNewForm("");
            if (newFormID != null) {
                router.push(`/form-editor/${newFormID}`);
            }
        }} className="rounded-full h-10 w-10 bg-blue-500 flex justify-center items-center"><FiPlus className="text-black" size={28} /></button>
    );
}