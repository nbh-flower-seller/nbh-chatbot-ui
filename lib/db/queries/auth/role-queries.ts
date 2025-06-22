import { db } from "@/lib/db/db-client";
import { userRole } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserRole(userId: string) {
    const userRoleData = await db.select().from(userRole).where(eq(userRole.userId, userId));

    return userRoleData;
}