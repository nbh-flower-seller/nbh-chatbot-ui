import { createDocumentHandler } from "@/lib/artifacts/server";

export const shopDocumentHandler = createDocumentHandler<'shop'>({
    kind: 'shop',
    onCreateDocument: async ({ title, dataStream }) => { },
    onUpdateDocument: async ({ document, description, dataStream }) => { },
});
