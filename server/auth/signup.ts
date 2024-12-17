"use server";

import { lucia } from "@/auth/lucia";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { hash } from "@node-rs/argon2";
import { auth_db } from "@/auth/database";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function signup(formData: { username: string, password: string }): Promise<null | string> {
	const username = formData.username;
	// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
	// keep in mind some database (e.g. mysql) are case insensitive
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return "Invalid username";
	}
	const password = formData.password;
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return "Invalid password";
	}

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const userId = generateIdFromEntropySize(10); // 16 characters long

	const [alreadyExists] = await auth_db.select().from(userTable).where(eq(userTable.username, username));
	if (alreadyExists) {
		return "This account already exists";
	}
	// TODO: check if username is already used
	await auth_db.insert(userTable).values({
		id: userId,
		username: username,
		password_hash: passwordHash
	});

	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return "Redirect";
}