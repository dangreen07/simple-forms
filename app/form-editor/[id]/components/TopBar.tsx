"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeleteForm } from "@/server/forms";
import { useRouter } from "next/navigation";
import { IoLinkOutline } from "react-icons/io5";

export default function TopBar({ formID, editor, setEditor }: { formID: string, setEditor: React.Dispatch<React.SetStateAction<boolean>>, editor: boolean }) {
    const router = useRouter();

    const responsesLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/form-completion/${formID}`;

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const copylink = (_: unknown) => {
        navigator.clipboard.writeText(responsesLink);
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Collect Responses</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Send and collect responses</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-md">Once somebody submits a response, you will only be able to delete or create new questions.</p>
                            <div className="flex items-center justify-between gap-2">
                                <IoLinkOutline size={30} />
                                <input value={responsesLink} contentEditable={false} className="input input-md input-bordered" />
                                <Button variant={"outline"} onClick={copylink}>Copy link</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button onClick={() => {
                    setEditor(!editor);
                }} variant="outline">{editor ? "Preview" : "Back"}</Button>
            </div>
        </div>
    );
}