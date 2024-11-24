import { Josefin_Sans } from "next/font/google";
import Link from "next/link";

const josefinSans = Josefin_Sans({ subsets: ["latin"] });

export default function NavigationControlledAccess() {
    return (
        <div id="navbar" className="flex justify-between py-10 items-center bg-neutral-100 px-2 sm:px-5">
            <div id="LHS" className="sm:block hidden">
                <p id="logo" className={`text-4xl font-semibold text-black ${josefinSans.className}`}>Simple Forms</p>
            </div>
            <div id="RHS" className='flex sm:justify-normal justify-between sm:gap-16 items-center w-full sm:w-fit'>
                <Link href={""} className='text-gray-400 font-medium text-xl'>About Us</Link>
                <Link href={""} className='text-gray-400 font-medium text-xl'>Pricing</Link>
                <Link href={"/dashboard"} className='text-gray-400 font-medium text-xl'>Dashboard</Link>
                <Link href={"/api/auth/logout"} className='bg-gray-300 p-3 text-black font-bold rounded-xl'>Log out</Link>
            </div>
        </div>
    )
}