import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import Link from "next/link";

export default function About() {
    return (
        <main className="min-h-screen bg-neutral-50">
            <NavigationAnyAccess />
            <div className="mx-auto max-w-3xl px-8 w-full h-full">
                <h1 className="text-5xl font-bold text-center pb-4">About</h1>
                <p className="text-lg">
                    Simple Forms is a simple forms making website. It is built using Next.js, React, and Tailwind CSS.
                </p>
                <p className="text-lg">
                    To find out more about similiar projects, I have worked on, check out my portfolio:
                </p>
                <Link href={"https://www.mrgreeny.dev"} className="link link-primary text-lg" target="_blank">Visit my portfolio</Link>
            </div>
        </main>
    )
}