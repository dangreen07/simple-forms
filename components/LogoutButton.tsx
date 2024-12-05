"use client";

import { logout } from "@/auth/logout";

export default function LogoutButton() {
    return (
        <button onClick={() => logout()} className='btn bg-blue-700 hover:bg-blue-700 hover:opacity-90 text-lg text-white'>Log out</button>
    )
}