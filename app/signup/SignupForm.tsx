"use client";

import { signup } from "@/server/auth/signup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    return (
        <div className="flex items-center justify-center flex-grow h-full">
            <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 flex flex-col">
                <h1 className="text-4xl font-bold py-6">Sign Up</h1>
                <div className="flex flex-col gap-6">
                    <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" name="username" placeholder="Username" className="input input-bordered w-full" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" placeholder="Password" className="input input-bordered w-full" />
                    {error != "" && 
                        <div role="alert" className="alert alert-warning">
                            <div className="text-lg text-black">Error: {error}</div>
                        </div>
                    }
                    <button onClick={async () => {
                        const response = await signup({ username, password });
                        if (response == "Redirect") {
                            router.push("/");
                        }
                        else if (response != null) {
                            setError(response);
                        }
                    }} type="submit" className="btn bg-blue-700 hover:bg-blue-700 hover:opacity-90 text-lg text-white">Sign Up</button>
                </div>
                <p className="text-lg text-center pt-6">Already have an account? <Link href="/login" className="link link-neutral">Login</Link></p>
            </div>
        </div>
    );
}