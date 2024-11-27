"use client";

import { CreateNewForm } from "@/server/forms";
import { useRouter } from "next/navigation";
import { FiEdit, FiPlus } from "react-icons/fi";

export default function YourForms({ forms } : { forms: {
    id: number,
    name: string,
}[] }) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-2 max-w-3xl mx-auto">
            <div className="px-5 py-3 flex justify-between items-center">
                <p className="text-4xl text-black font-bold">Your Forms</p>
                <button onClick={async () => {
                    const newFormID = await CreateNewForm("");
                    if (newFormID != null) {
                        router.push(`/form-editor/${newFormID}`);
                    }
                }} className="rounded-full h-10 w-10 bg-blue-500 flex justify-center items-center"><FiPlus className="text-black" size={28} /></button>
            </div>
            {forms.map((current, index) => {
                return (
                    <div key={index} className="bg-gray-300 px-5 py-3 rounded-3xl flex justify-between">
                        <p className="text-2xl text-black font-bold">{current.name}</p>
                        <button onClick={() => {
                            router.push(`/form-editor/${current.id}`);
                        }}><FiEdit className="text-black" size={28} /></button>
                    </div>
                );
            })}
        </div>
    )
}