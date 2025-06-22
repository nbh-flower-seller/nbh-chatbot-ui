import { db } from "@/lib/db/db-client";
import { DBMessage, message, vote } from "@/lib/db/schema";
import { and, asc, eq, gte, inArray } from "drizzle-orm";

export async function getMessageById({ id }: { id: string }) {
    try {
        return await db.select().from(message).where(eq(message.id, id));
    } catch (error) {
        console.error('Failed to get message by id from database');
        throw error;
    }
}

export async function saveMessages({
    messages,
}: {
    messages: Array<DBMessage>;
}) {
    try {
        return await db.insert(message).values(messages);
    } catch (error) {
        console.error('Failed to save messages in database', error);
        throw error;
    }
}

export async function getMessagesByconversationId({ id }: { id: string }) {
    try {
        return await db
            .select()
            .from(message)
            .where(eq(message.conversationId, id))
            .orderBy(asc(message.createdAt));
    } catch (error) {
        console.error('Failed to get messages by conversation id from database', error);
        throw error;
    }
}

export async function voteMessage({
    conversationId,
    messageId,
    type,
}: {
    conversationId: string;
    messageId: string;
    type: 'up' | 'down';
}) {
    try {
        const [existingVote] = await db
            .select()
            .from(vote)
            .where(and(eq(vote.messageId, messageId)));

        if (existingVote) {
            return await db
                .update(vote)
                .set({ isUpvoted: type === 'up' })
                .where(and(eq(vote.messageId, messageId), eq(vote.conversationId, conversationId)));
        }
        return await db.insert(vote).values({
            conversationId,
            messageId,
            isUpvoted: type === 'up',
        });
    } catch (error) {
        console.error('Failed to upvote message in database', error);
        throw error;
    }
}

export async function deleteMessagesByConversationIdAfterTimestamp({
    conversationId,
    timestamp,
}: {
    conversationId: string;
    timestamp: Date;
}) {
    try {
        const messagesToDelete = await db
            .select({ id: message.id })
            .from(message)
            .where(
                and(eq(message.conversationId, conversationId), gte(message.createdAt, timestamp)),
            );

        const messageIds = messagesToDelete.map((message) => message.id);

        if (messageIds.length > 0) {
            await db
                .delete(vote)
                .where(
                    and(eq(vote.conversationId, conversationId), inArray(vote.messageId, messageIds)),
                );

            return await db
                .delete(message)
                .where(
                    and(eq(message.conversationId, conversationId), inArray(message.id, messageIds)),
                );
        }
    } catch (error) {
        console.error(
            'Failed to delete messages by id after timestamp from database',
        );
        throw error;
    }
}