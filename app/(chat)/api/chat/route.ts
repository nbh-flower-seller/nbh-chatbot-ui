import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
  DataStreamWriter,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteConversationById,
  getConversationById,
  saveConversation,
} from '@/lib/db/queries/chat/conversation-queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { saveMessages } from '@/lib/db/queries/chat/message-queries';
import { checkProduct } from '@/lib/ai/tools/custom-tools/check-product';
import { makeOrder } from '@/lib/ai/tools/custom-tools/make-order';
import { detectProduct } from '@/lib/ai/tools/custom-tools/detect-product';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    // console.log('session', session);

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    // console.log('userMessage', userMessage);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // FLOWER DETECTION FLOW: If user message has image attachment, run detectProduct and prepend result as context
    let processedMessages = messages
    const attachments = userMessage.experimental_attachments ?? []
    const imageAttachment = attachments.length > 0 ? attachments[0] : null
    let detectionResult: any = null


    const conversation = await getConversationById({ id });

    // console.log('chat', chat);

    if (!conversation) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveConversation({ id, userId: session.user.id, title });
    } else {
      if (conversation.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    if (imageAttachment && imageAttachment.url) {
      // Create a minimal mock DataStreamWriter for detectProduct
      const tempStream = {
        writeData: () => { },
        write: () => { },
        writeMessageAnnotation: () => { },
        writeSource: () => { },
        merge: () => { },
        onError: undefined
      }
      // Call detectProduct tool directly
      const detectProductTool = detectProduct({ session, dataStream: tempStream })
      const toolResult = await detectProductTool.execute(
        { imageUrl: imageAttachment.url },
        { toolCallId: 'manual-flower-detect', messages: [] }
      )
      detectionResult = toolResult?.detection
      // Prepend a system message with the detection result as context
      if (detectionResult) {
        // const detectionText = `Flower detection result: ${JSON.stringify(detectionResult)}. Use this information to answer the user's question.`
        // processedMessages = [
        //   {
        //     id: `detection-context-${userMessage.id}`,
        //     role: 'system',
        //     content: detectionText,
        //     parts: [
        //       { type: 'text', text: detectionText }
        //     ]
        //   },
        //   ...messages
        // ]

        await saveMessages({
          messages: [
            {
              conversationId: id,
              id: userMessage.id,
              role: 'assistant',
              parts: [
                { type: 'text', text: detectionResult.flower_name }
              ],
              attachments: userMessage.experimental_attachments ?? [],
              createdAt: new Date(),
            },
          ],
        })
      }
    } else {
      await saveMessages({
        messages: [
          {
            conversationId: id,
            id: userMessage.id,
            role: 'user',
            parts: userMessage.parts,
            attachments: userMessage.experimental_attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
    }

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages: processedMessages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                'getWeather',
                'createDocument',
                'updateDocument',
                'requestSuggestions',
                'checkProduct',
                'makeOrder',
                'detectProduct',
              ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            checkProduct: checkProduct({ session, dataStream }),
            makeOrder: makeOrder({ session, dataStream }),
            detectProduct: detectProduct({ session, dataStream }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      conversationId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Error in chat route', error);
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    console.error('Error in chat route', error);
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const conversation = await getConversationById({ id });

    if (conversation.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteConversationById({ id });

    return new Response('Conversation deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
