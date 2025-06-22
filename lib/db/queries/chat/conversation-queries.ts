import { db } from "@/lib/db/db-client";
import { conversation, DBMessage, message, vote } from "@/lib/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";

export async function saveConversation({
    id,
    userId,
    title,
}: {
    id: string;
    userId: string;
    title: string;
}) {
    try {
        return await db.insert(conversation).values({
            id,
            createdAt: new Date(),
            userId,
            title,
        });
    } catch (error) {
        console.error('Failed to save conversation in database');
        throw error;
    }
}

export async function deleteConversationById({ id }: { id: string }) {
    try {
        await db.delete(vote).where(eq(vote.conversationId, id));
        await db.delete(message).where(eq(message.conversationId, id));

        return await db.delete(conversation).where(eq(conversation.id, id));
    } catch (error) {
        console.error('Failed to delete conversation by id from database');
        throw error;
    }
}

export async function getConversationsByUserId({ id }: { id: string }) {
    try {
        return await db
            .select()
            .from(conversation)
            .where(eq(conversation.userId, id))
            .orderBy(desc(conversation.createdAt));
    } catch (error) {
        console.error('Failed to get conversations by user from database');
        throw error;
    }
}

export async function getConversationById({ id }: { id: string }) {
    try {
        const [selectedConversation] = await db.select().from(conversation).where(eq(conversation.id, id));
        return selectedConversation;
    } catch (error) {
        console.error('Failed to get conversation by id from database');
        throw error;
    }
}

export async function getVotesByConversationId({ id }: { id: string }) {
    try {
        return await db.select().from(vote).where(eq(vote.conversationId, id));
    } catch (error) {
        console.error('Failed to get votes by conversation id from database', error);
        throw error;
    }
}

export async function updateConversationVisiblityById({
    conversationId,
    visibility,
}: {
    conversationId: string;
    visibility: 'private' | 'public';
}) {
    try {
        return await db.update(conversation).set({ visibility }).where(eq(conversation.id, conversationId));
    } catch (error) {
        console.error('Failed to update conversation visibility in database');
        throw error;
    }
}