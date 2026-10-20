import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRecaptcha } from "@/lib/server";

const schema = z.object({ token: z.string().max(6000).default(""), action: z.string().regex(/^[a-z_]{2,40}$/), fallback: z.boolean().optional() });
export async function POST(request: Request) {
  const payload = schema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ success: false, error: "Invalid security check request." }, { status: 400 });
  const result = await verifyRecaptcha(payload.data.token, payload.data.action, Boolean(payload.data.fallback));
  if (result.fallbackRequired) return NextResponse.json(result, { status: 428 });
  return NextResponse.json(result, { status: result.success ? 200 : 403 });
}
