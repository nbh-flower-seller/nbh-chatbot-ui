import { genSaltSync, hashSync } from 'bcrypt-ts';
import { userCredentials } from "@/lib/db/schema";
import { db } from '@/lib/db/db-client';
import { eq } from 'drizzle-orm';
export async function createUserCredentials(userId: string, email: string, password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    try {
        return await db.insert(userCredentials).values({ userId, email, password: hash });
    } catch (error) {
        console.error('Failed to create user credentials in database');
        throw error;
    }
}

export async function getUserCredentialById(id: string) {
    try {
        return await db.select().from(userCredentials).where(eq(userCredentials.userId, id));
    } catch (error) {
        console.error('Failed to get user credential by id from database');
        throw error;
    }
}