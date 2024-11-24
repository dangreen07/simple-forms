import NavigationControlledAccess from "@/components/NavigationControlledAccess";
import Link from "next/link";
import { FiEdit, FiPlus } from "react-icons/fi";


export default function Page() {
    return (
        <div className="bg-neutral-100 min-h-screen sm:px-28">
            <NavigationControlledAccess />
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                <div className="px-5 py-3 flex justify-between">
                    <p className="text-2xl text-black font-bold">Your Forms</p>
                    <Link href={"/form-editor"} className="rounded-full h-10 w-10 bg-blue-500 flex justify-center items-center"><FiPlus className="text-black" size={28} /></Link>
                </div>
                <div className="bg-gray-300 px-5 py-3 rounded-3xl flex justify-between">
                    <p className="text-2xl text-black font-bold">Form Name</p>
                    <button><FiEdit className="text-black" size={28} /></button>
                </div>
            </div>
        </div>
    )
}