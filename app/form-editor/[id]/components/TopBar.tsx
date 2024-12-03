"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeleteForm } from "@/server/forms";
import { useRouter } from "next/navigation";

export default function TopBar({ formID, editor, setEditor }: { formID: string, setEditor: React.Dispatch<React.SetStateAction<boolean>>, editor: boolean }) {
    const router = useRouter();

    async function handleDeleteForm() {
        const confirmation = window.confirm("Are you sure you want to delete this form?");
        if (confirmation) {
            try {
                await DeleteForm(formID);
                router.prefetch("/dashboard");
                router.push('/dashboard');
            } catch (error) {
                console.error("Failed to delete the form", error);
                alert("Failed to delete the form.");
            }
        }
    }

    return (
        <div className="flex justify-center">
            <div className="flex h-full justify-end my-2 max-w-6xl flex-grow px-4 gap-3">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Settings</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>
                                Make changes to the form settings here. Click save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center">
                            <Button variant="destructive" onClick={handleDeleteForm}>Delete Form</Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="submit">Save changes</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button onClick={() => {
                    setEditor(!editor);
                }} variant="outline">{editor ? "Preview" : "Back"}</Button>
            </div>
        </div>
    );
}