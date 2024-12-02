"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton({ id }: { id: string}) {
    const router = useRouter();

    return (
        <Button onClick={() => {
            router.push("/form-editor/" + id +"?from_preview=true");
        }} variant="outline">Back</Button>
    )
}