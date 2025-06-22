'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByConversationIdAfterTimestamp,
} from '@/lib/db/queries/chat/message-queries';
import { updateConversationVisiblityById } from '@/lib/db/queries/chat/conversation-queries';
import { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
import { getMessageById } from '@/lib/db/queries/chat/message-queries';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByConversationIdAfterTimestamp({
    conversationId: message.conversationId,
    timestamp: message.createdAt,
  });
}

export async function updateConversationVisibility({
  conversationId,
  visibility,
}: {
  conversationId: string;
  visibility: VisibilityType;
}) {
  await updateConversationVisiblityById({ conversationId, visibility });
}
