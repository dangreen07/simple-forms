import { getSession } from "@auth0/nextjs-auth0/edge";
import { Josefin_Sans } from "next/font/google";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";

const josefinSans = Josefin_Sans({ subsets: ["latin"] });

export default async function NavigationAnyAccess({ checkSession = true, background = 'bg-transparent', textColor = 'text-gray-500' }) {
  let user = true;
  if (checkSession) {
    const session = await getSession();
    user = session?.user != undefined;
  }

  return (
    <div id="navbar" className={`flex justify-between w-screen px-6 md:px-16 lg:px-32 h-[6rem] py-6 items-center ${background}`}>
      <div id="LHS" className="flex justify-between items-center w-full md:w-auto">
        <Link href="/" id="logo" className={`text-2xl sm:text-3xl md:text-4xl font-semibold text-black ${josefinSans.className}`}>Simple Forms</Link>
        <div className="dropdown md:hidden dropdown-left">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <RxHamburgerMenu size={24} className={textColor} />
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href={""} className={`${textColor} font-medium text-lg md:text-xl`}>About Us</Link></li>
            <li><Link href={""} className={`${textColor} font-medium text-lg md:text-xl`}>Pricing</Link></li>
            {user && <li><Link href={"/dashboard"} className={`${textColor} font-medium text-lg md:text-xl`}>Dashboard</Link></li>}
            {!user && <li><Link href={"/api/auth/login"} className='bg-blue-700 p-3 text-white font-bold rounded-xl'>JOIN NOW</Link></li>}
            {user && <li><Link href={"/api/auth/logout"} className='bg-blue-700 p-3 text-white font-bold rounded-xl'>Log out</Link></li>}
          </ul>
        </div>
      </div>
      <div id="RHS" className="hidden md:flex gap-4 md:gap-16 items-center">
        <Link href={""} className={`${textColor} font-medium text-xl`}>About Us</Link>
        <Link href={""} className={`${textColor} font-medium text-xl`}>Pricing</Link>
        {user && <Link href={"/dashboard"} className={`${textColor} font-medium text-xl`}>Dashboard</Link>}
        {!user && <Link href={"/api/auth/login"} className='bg-blue-700 p-1 lg:p-3 text-white font-bold rounded-xl text-center'>JOIN NOW</Link>}
        {user && <Link href={"/api/auth/logout"} className='bg-blue-700 p-1 lg:p-3 text-white font-bold rounded-xl text-center'>Log out</Link>}
      </div>
    </div>
  );
}