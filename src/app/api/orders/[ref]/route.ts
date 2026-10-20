import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrder } from "@/lib/server";
export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in to view this order." }, { status: 401 });
  const { ref } = await params;
  const order = await getOrder(ref);
  if (!order || order.email.toLowerCase() !== session.user.email.toLowerCase()) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json(order, { headers: { "Cache-Control": "private, no-store" } });
}
