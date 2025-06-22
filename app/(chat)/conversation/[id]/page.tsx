import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getConversationById } from '@/lib/db/queries/chat/conversation-queries';
import { getMessagesByconversationId } from '@/lib/db/queries/chat/message-queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DBMessage } from '@/lib/db/schema';
import { Attachment, UIMessage } from 'ai';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const conversation = await getConversationById({ id });

  if (!conversation) {
    notFound();
  }

  const session = await auth();

  if (conversation.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== conversation.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByconversationId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={conversation.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={conversation.visibility}
          isReadonly={session?.user?.id !== conversation.userId}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={conversation.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={conversation.visibility}
        isReadonly={session?.user?.id !== conversation.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
