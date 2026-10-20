import nodemailer from "nodemailer";
import { kv } from "@vercel/kv";
import type { Product } from "@/lib/data";

type PrescriptionRecord = { reference: string; email: string; name: string; fileUrl: string; createdAt: string };
type SavedOrder = { ref: string; email: string; name: string; phone: string; address: string; zone: string; slot: string; status: string; createdAt: string; total: number; deliveryFee: number; items: { product: Product; quantity: number; packSize: string }[] };
type MemoryStore = { prescriptions: Map<string, PrescriptionRecord>; orders: Map<string, SavedOrder>; ordersByEmail: Map<string, string[]> };
const root = globalThis as typeof globalThis & { naomiMemory?: MemoryStore };
const memory: MemoryStore = root.naomiMemory ??= { prescriptions: new Map<string, PrescriptionRecord>(), orders: new Map<string, SavedOrder>(), ordersByEmail: new Map<string, string[]>() };
const kvReady = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export async function verifyRecaptcha(token: string, action: string, fallback = false) {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    if (process.env.NODE_ENV !== "production") return { success: true, score: 1 };
    return { success: false, error: "Security verification is not configured." };
  }
  if (!token) return { success: false, error: "Please complete the security check." };
  try {
    const body = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: token });
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
    const result = await response.json() as { success?: boolean; score?: number; action?: string };
    if (!result.success) return { success: false, error: "Security check failed. Please try again." };
    if (!fallback && (result.action !== action || (result.score ?? 0) < 0.5)) return { success: false, fallbackRequired: true, score: result.score ?? 0 };
    return { success: true, score: result.score ?? 0 };
  } catch { return { success: false, error: "Security check is temporarily unavailable." }; }
}

export async function savePrescription(record: PrescriptionRecord) {
  memory.prescriptions.set(record.reference, record);
  if (kvReady) await kv.set(`prescription:${record.reference}`, record);
}
export async function getPrescription(reference: string) {
  if (kvReady) { try { return await kv.get<PrescriptionRecord>(`prescription:${reference}`); } catch { return memory.prescriptions.get(reference) ?? null; } }
  return memory.prescriptions.get(reference) ?? null;
}
export async function saveOrder(order: SavedOrder) {
  memory.orders.set(order.ref, order);
  const emailKey = order.email.toLowerCase();
  memory.ordersByEmail.set(emailKey, [order.ref, ...(memory.ordersByEmail.get(emailKey) ?? []).filter((ref) => ref !== order.ref)]);
  if (kvReady) {
    await kv.set(`order:${order.ref}`, order);
    await kv.lpush(`orders-by-email:${emailKey}`, order.ref);
    await kv.ltrim(`orders-by-email:${emailKey}`, 0, 49);
  }
}
export async function getOrdersByEmail(email: string) {
  const normalized = email.toLowerCase();
  if (kvReady) {
    try {
      const refs = await kv.lrange(`orders-by-email:${normalized}`, 0, 49) as string[];
      const orders = await Promise.all(refs.map((ref) => getOrder(ref)));
      return orders.filter((order: SavedOrder | null): order is SavedOrder => Boolean(order && order.email.toLowerCase() === normalized));
    } catch { /* Local development can fall back to the in-memory store. */ }
  }
  return (memory.ordersByEmail.get(normalized) ?? []).map((ref: string) => memory.orders.get(ref)).filter((order: SavedOrder | undefined): order is SavedOrder => Boolean(order));
}
export async function getOrder(reference: string) {
  if (kvReady) { try { return await kv.get<SavedOrder>(`order:${reference}`); } catch { return memory.orders.get(reference) ?? null; } }
  return memory.orders.get(reference) ?? null;
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) return false;
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
  return true;
}
