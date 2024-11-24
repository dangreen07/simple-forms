"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Josefin_Sans } from "next/font/google";
import Link from "next/link";

const josefinSans = Josefin_Sans({ subsets: ["latin"] });

export default function NavigationAnyAccess() {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        <div id="navbar" className="flex justify-between w-screen px-32 py-10 items-center">
          <div id="LHS">
            <p id="logo" className={`text-4xl font-semibold text-black ${josefinSans.className}`}>Simple Forms</p>
          </div>
          <div id="RHS" className='flex gap-16 items-center'>
            <Link href={""} className='text-gray-400 font-medium text-xl'>About Us</Link>
            <Link href={""} className='text-gray-400 font-medium text-xl'>Pricing</Link>
            { user && <Link href={"/dashboard"} className='text-gray-400 font-medium text-xl'>Dashboard</Link> }
            {!user && <Link href={"/api/auth/login"} className='bg-gray-300 p-3 text-black font-bold rounded-xl'>JOIN NOW</Link> }
            {user && <Link href={"/api/auth/logout"} className='bg-gray-300 p-3 text-black font-bold rounded-xl'>Log out</Link>}
          </div>
        </div>
    )
}