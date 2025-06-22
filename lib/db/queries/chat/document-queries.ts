import { ArtifactKind } from "@/components/artifact";
import { db } from "@/lib/db/db-client";
import { document, message, suggestion } from "@/lib/db/schema";
import { asc, and, eq, desc, gt, inArray } from "drizzle-orm";

export async function saveDocument({
    id,
    title,
    kind,
    content,
    userId,
}: {
    id: string;
    title: string;
    kind: ArtifactKind;
    content: string;
    userId: string;
}) {
    try {
        return await db.insert(document).values({
            id,
            title,
            kind,
            content,
            userId,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('Failed to save document in database');
        throw error;
    }
}

export async function getDocumentsByIds({ ids }: { ids: string[] }) {
    try {
        const documents = await db
            .select()
            .from(document)
            .where(inArray(document.id, ids))
            .orderBy(asc(document.createdAt));

        return documents;
    } catch (error) {
        console.error('Failed to get document by id from database');
        throw error;
    }
}

export async function getDocumentById({ id }: { id: string }) {
    try {
        const [selectedDocument] = await db
            .select()
            .from(document)
            .where(eq(document.id, id))
            .orderBy(desc(document.createdAt));

        return selectedDocument;
    } catch (error) {
        console.error('Failed to get document by id from database');
        throw error;
    }
}

export async function deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp,
}: {
    id: string;
    timestamp: Date;
}) {
    try {
        await db
            .delete(suggestion)
            .where(
                and(
                    eq(suggestion.documentId, id),
                    gt(suggestion.documentCreatedAt, timestamp),
                ),
            );

        return await db
            .delete(document)
            .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
    } catch (error) {
        console.error(
            'Failed to delete documents by id after timestamp from database',
        );
        throw error;
    }
}