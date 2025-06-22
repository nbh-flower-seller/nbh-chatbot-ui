import { tool } from 'ai'
import { z } from 'zod'
import { DataStreamWriter, generateObject } from 'ai'
import { Session } from 'next-auth'
import { openai } from '@ai-sdk/openai'

interface DetectProductProps {
	session: Session
	dataStream: DataStreamWriter
}

export const detectProduct = ({ session, dataStream }: DetectProductProps) =>
	tool({
		description: 'Call this tool when user need to detect a flower product from an image. Detect flower products from an image using OpenAI Vision model.',
		parameters: z.object({
			imageUrl: z.string().describe('URL of the image to analyze'),
		}),
		execute: async ({ imageUrl }) => {
			try {
				console.log('detectProduct called with imageUrl', { imageUrl })
				const response = await generateObject({
					model: openai('o4-mini-2025-04-16'),
					messages: [
						{
							role: 'user',
							content: 'Detect the flower product from the image. Format the response as JSON with fields: flower_name, and confidence (0-1).',
							experimental_attachments: [
								{
									url: imageUrl,
									contentType: 'image/*'
								}
							]
						}
					],
					schema: z.object({
						flower_name: z.string(),
						confidence: z.number().min(0).max(1)
					})
				})

				// Stream the detection results
				dataStream.writeData({
					type: 'detection',
					content: JSON.stringify(response.object)
				})

				return {
					success: true,
					detection: response.object
				}

			} catch (error) {
				console.error('Error in detectProduct tool:', error)

				dataStream.writeData({
					type: 'detection-error',
					content: error instanceof Error ? error.message : 'Unknown error occurred'
				})

				return {
					success: false,
					message: `Error detecting flower: ${error instanceof Error ? error.message : 'Unknown error'}`
				}
			}
		}
	})
