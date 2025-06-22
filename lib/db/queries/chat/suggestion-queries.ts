import { db } from "@/lib/db/db-client";
import { Suggestion, suggestion } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function saveSuggestions({
    suggestions,
}: {
    suggestions: Array<Suggestion>;
}) {
    try {
        return await db.insert(suggestion).values(suggestions);
    } catch (error) {
        console.error('Failed to save suggestions in database');
        throw error;
    }
}

export async function getSuggestionsByDocumentId({
    documentId,
}: {
    documentId: string;
}) {
    try {
        return await db
            .select()
            .from(suggestion)
            .where(and(eq(suggestion.documentId, documentId)));
    } catch (error) {
        console.error(
            'Failed to get suggestions by document version from database',
        );
        throw error;
    }
}