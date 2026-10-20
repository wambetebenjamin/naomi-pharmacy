import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, verifyRecaptcha } from "@/lib/server";
const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(200), message: z.string().trim().min(10).max(2000), captchaToken: z.string().max(6000).default(""), captchaFallback: z.boolean().optional() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the information in your message." }, { status: 400 });
  const captcha = await verifyRecaptcha(parsed.data.captchaToken, "contact", Boolean(parsed.data.captchaFallback));
  if (!captcha.success) return NextResponse.json({ error: captcha.error || "Security check failed." }, { status: 403 });
  try {
    const recipient = process.env.SMTP_FROM || process.env.SMTP_USER || "hello@naomipharmacy.co.ke";
    const sent = await sendEmail({ to: recipient, subject: `Naomi Pharmacy message from ${parsed.data.name}`, text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}` });
    if (!sent) return NextResponse.json({ error: "Messaging is not configured yet. Please contact us on WhatsApp." }, { status: 503 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Your message could not be sent. Please contact us on WhatsApp." }, { status: 500 }); }
}
