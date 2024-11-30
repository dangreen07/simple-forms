import { getSession } from "@auth0/nextjs-auth0/edge";
import { Josefin_Sans } from "next/font/google";
import Link from "next/link";

const josefinSans = Josefin_Sans({ subsets: ["latin"] });

export default async function NavigationAnyAccess({ checkSession=true, background='bg-transparent', textColor='text-gray-500' }) {
  let user = true;
  if (checkSession) {
    const session = await getSession();
    user = session?.user != undefined;
  }

  return (
      <div id="navbar" className={`flex justify-between w-screen px-32 py-6 items-center ${background}`}>
        <div id="LHS">
          <Link href="/" id="logo" className={`text-4xl font-semibold text-black ${josefinSans.className}`}>Simple Forms</Link>
        </div>
        <div id="RHS" className='flex gap-16 items-center'>
          <Link href={""} className={`${textColor} font-medium text-xl`}>About Us</Link>
          <Link href={""} className={`${textColor} font-medium text-xl`}>Pricing</Link>
          { user && <Link href={"/dashboard"} className={`${textColor} font-medium text-xl`}>Dashboard</Link> }
          {!user && <Link href={"/api/auth/login"} className='bg-primary p-3 text-primary-content font-bold rounded-xl'>JOIN NOW</Link> }
          {user && <Link href={"/api/auth/logout"} className='bg-primary p-3 text-primary-content font-bold rounded-xl'>Log out</Link>}
        </div>
      </div>
  );
}