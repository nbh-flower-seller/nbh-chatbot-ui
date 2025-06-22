import { auth } from '@/app/(auth)/auth';
import { getConversationsByUserId } from '@/lib/db/queries/chat/conversation-queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const conversations = await getConversationsByUserId({ id: session.user.id! });
  return Response.json(conversations);
}
