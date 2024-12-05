"use server";

import { db } from "@/auth/database";
import { lucia } from "@/auth/lucia";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verify } from "@node-rs/argon2";

export async function login(formData: {username: string, password: string}): Promise<null | string> {
    const username = formData.username;
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return null;
	}
    const password = formData.password;
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return "Invalid password";
	}
    const [ existingUser ] = await db.select().from(userTable).where(eq(userTable.username, username));
    if (existingUser == undefined) {
        // NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
		// If usernames are public, you may outright tell the user that the username is invalid.
		return "Invalid username";
    }
    const validPassword = await verify(existingUser.password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
    if (!validPassword) {
        console.error("Invalid password");
		return "Invalid password";
    }
    
    const session = await lucia.createSession(existingUser.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return "Redirect";
}