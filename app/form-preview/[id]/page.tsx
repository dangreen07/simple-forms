"use server";

import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import { GetFormData } from "@/server/forms";
import { redirect } from "next/navigation";
import BackButton from "./BackButton";
import ChoiceQuestionForm from "@/components/form/ChoiceQuestionForm";
import TextQuestionForm from "@/components/form/TextQuestionForm";
import RatingQuestionForm from "@/components/form/RatingQuestionForm";
import { question } from "@/server/types";
import DateQuestionForm from "@/components/form/DateQuestionForm";
import RankingQuestionForm from "@/components/form/RankingQuestionForm";

export default async function Page({ params }: {params: { id: string } }) {
    const data = await GetFormData(params.id);
    if (data == null) {
        // Invalid credentials or the form doesn't exist
        // TODO: Redirect to login page
        redirect("/api/auth/login");
    }

    function outputQuestion(current: question, index: number) {
        if (data == null) {
            return null;
        }
        if (current.type == "Choice") {
            return <ChoiceQuestionForm key={index} questions={data.questions} index={index} />
        }
        else if (current.type == "Text") {
            return <TextQuestionForm key={index} questions={data.questions} index={index} />
        }
        else if (current.type == "Rating") {
            return <RatingQuestionForm key={index} questions={data.questions} index={index} />
        }
        else if (current.type == "Date") {
            return <DateQuestionForm key={index} questions={data.questions} index={index} />
        }
        else if (current.type == "Ranking") {
            return <RankingQuestionForm key={index} questions={data.questions} index={index} />
        }
    }

    return (
        <main className="flex flex-col min-h-screen bg-blue-300">
            <div className="fixed top-0 w-full"><NavigationAnyAccess checkSession={false} background="bg-blue-300" textColor="text-gray-800" /></div>
            <div className="pt-24" />
            <div className="flex flex-col flex-grow bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
                <div className="flex justify-center">
                    <div className="flex h-full justify-start py-2 max-w-6xl flex-grow px-4 gap-3">
                        <BackButton />
                    </div>
                </div>
                <div className="flex flex-grow justify-center pb-6">
                    <div className="flex flex-col max-w-6xl flex-grow bg-neutral-200 rounded-3xl bg-opacity-80 p-3 sm:p-12 gap-3">
                        <p className="text-3xl sm:text-4xl md:text-5xl font-semibold">{data.formName}</p>
                        {data.questions.map((current, index) => outputQuestion(current, index))}
                    </div>
                </div>
            </div>
        </main>
    )
}