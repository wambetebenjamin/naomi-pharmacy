import { NextResponse } from "next/server";
import { z } from "zod";
import { products } from "@/lib/data";
import { getPrescription, saveOrder, sendEmail, verifyRecaptcha } from "@/lib/server";

const schema = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(30), email: z.string().email().max(200), address: z.string().trim().min(8).max(400), zone: z.string().min(2).max(80), slot: z.string().min(2).max(80), prescriptionReference: z.string().max(60).optional(), captchaToken: z.string().max(6000).default(""), captchaFallback: z.boolean().optional(), items: z.array(z.object({ slug: z.string().min(1), quantity: z.number().int().min(1).max(20), packSize: z.string().max(80) })).min(1).max(30) });
const zones: Record<string, number> = { "Central Nairobi": 250, "Westlands and Parklands": 300, "Kilimani and Lavington": 300, "Eastlands and Embakasi": 350, "Greater Nairobi": 500 };
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN)) return NextResponse.json({ error: "Order storage is not configured. Please contact our pharmacy team." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your delivery details and basket." }, { status: 400 });
  const input = parsed.data;
  const captcha = await verifyRecaptcha(input.captchaToken, "checkout", Boolean(input.captchaFallback));
  if (!captcha.success) return NextResponse.json({ error: captcha.error || "Security check failed." }, { status: 403 });
  const zoneFee = zones[input.zone];
  if (zoneFee === undefined) return NextResponse.json({ error: "Choose a valid delivery zone." }, { status: 400 });
  const items = input.items.map((line) => {
    const product = products.find((item) => item.slug === line.slug);
    if (!product || !product.options.includes(line.packSize)) return null;
    return { product, quantity: line.quantity, packSize: line.packSize };
  });
  if (items.some((item) => !item)) return NextResponse.json({ error: "One or more products are no longer available." }, { status: 400 });
  const validItems = items as NonNullable<(typeof items)[number]>[];
  const containsRx = validItems.some((item) => item.product.rx);
  if (containsRx) {
    if (!input.prescriptionReference) return NextResponse.json({ error: "A prescription reference is needed for prescription medicines." }, { status: 400 });
    const prescription = await getPrescription(input.prescriptionReference);
    if (!prescription || prescription.email !== input.email.toLowerCase()) return NextResponse.json({ error: "We could not match that prescription reference to this email address." }, { status: 400 });
  }
  const subtotal = validItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1500 ? 0 : zoneFee;
  const total = subtotal + deliveryFee;
  const reference = `NP-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const order = { ref: reference, email: input.email.toLowerCase(), name: input.name, phone: input.phone, address: input.address, zone: input.zone, slot: input.slot, status: "Awaiting M-Pesa payment", createdAt: new Date().toISOString(), total, deliveryFee, items: validItems };
  try {
    await saveOrder(order);
    await sendEmail({ to: process.env.SMTP_FROM || process.env.SMTP_USER || "hello@naomipharmacy.co.ke", subject: `New Naomi Pharmacy order, ${reference}`, text: `New order received.\nReference: ${reference}\nName: ${input.name}\nPhone: ${input.phone}\nEmail: ${input.email}\nDelivery zone: ${input.zone}\nAddress: ${input.address}\nTotal: KES ${total}\nPayment status: Awaiting M-Pesa payment.` });
    return NextResponse.json({ reference, total, deliveryFee, payment: "M-Pesa selected, payment instructions will be confirmed by the pharmacy", status: order.status }, { status: 201 });
  } catch (error) {
    console.error("Order save failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "We could not securely save your order. Please try again." }, { status: 500 });
  }
}
