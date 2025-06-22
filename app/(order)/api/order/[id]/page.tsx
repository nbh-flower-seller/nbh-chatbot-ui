import { auth } from "@/app/(auth)/auth";
import { getOrderById } from "@/lib/db/queries/order/queries";

export async function GET({ params }: { params: { id: string } }) {
  const { id } = params;
  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const order = await getOrderById({ id });

  return new Response(JSON.stringify(order), { status: 200 });
}
