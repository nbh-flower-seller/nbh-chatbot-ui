import { z } from 'zod';
import { orderPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { generateObject } from "ai";

export const orderDocumentHandler = createDocumentHandler<'order'>({
	kind: 'order',
	onCreateDocument: async ({ title, dataStream }) => {
		const { object } = await generateObject({
			model: myProvider.languageModel('customer-service-model'),
			system: orderPrompt,
			prompt: title,
			schema: z.object({
				date: z.string(),
				items: z.array(z.object({
					name: z.string(),
					quantity: z.number(),
				})),
			}),
		});

		console.log('object', object);

		return JSON.stringify(object);
	},
	onUpdateDocument: async ({ document, description, dataStream }) => {
		return '';
	},
});