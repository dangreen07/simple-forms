"use client";

import NavigationControlledAccess from "@/components/NavigationControlledAccess";

export default function Page() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-300 to-red-300">
            <NavigationControlledAccess />
            <div className="flex w-screen justify-center">
                <div className="flex flex-grow max-w-6xl justify-end h-12 items-center px-2">
                    <button className="btn btn-primary btn-sm">Save</button>
                </div>
            </div>
            <div className="flex w-screen h-full flex-grow justify-center">
                <div className="bg-neutral-100 max-w-6xl flex-grow mb-12 rounded-lg">
                    <div id="form-content" className="w-full flex flex-col text-black px-2 sm:px-12 py-16">
                        <input className="text-3xl sm:text-5xl font-semibold bg-neutral-100 border-none outline-none" placeholder="Form title here..." />
                    </div>
                </div>
            </div>
        </div>
    )
}