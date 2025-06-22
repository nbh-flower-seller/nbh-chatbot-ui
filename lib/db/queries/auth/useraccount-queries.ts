import { UserAccount, userAccount } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/db-client";

export async function getUserAccountByEmail(email: string): Promise<Array<UserAccount>> {
	try {
		return await db.select().from(userAccount).where(eq(userAccount.email, email));
	} catch (error) {
		console.error('Failed to get user account by email from database');
		throw error;
	}
}

export async function createUserAccount(email: string): Promise<void> {
	try {
		await db.insert(userAccount).values({
			name: email.split('@')[0], // Use part of email as name
			email,
		});
	} catch (error) {
		console.error('Failed to create user account by email from database', error);
		throw error;
	}
}