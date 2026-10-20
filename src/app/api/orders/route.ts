import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrdersByEmail } from "@/lib/server";
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
  const orders = await getOrdersByEmail(session.user.email);
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "private, no-store" } });
}
