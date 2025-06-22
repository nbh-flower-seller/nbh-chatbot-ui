import { auth } from '@/app/(auth)/auth';
import { getConversationById, getVotesByConversationId } from '@/lib/db/queries/chat/conversation-queries';
import { voteMessage } from '@/lib/db/queries/chat/message-queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return new Response('conversationId is required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const conversation = await getConversationById({ id: conversationId });

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 });
  }

  if (conversation.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByConversationId({ id: conversationId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    conversationId,
    messageId,
    type,
  }: { conversationId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!conversationId || !messageId || !type) {
    return new Response('conversationId, messageId and type are required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const conversation = await getConversationById({ id: conversationId });

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 });
  }

  if (conversation.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await voteMessage({
    conversationId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
