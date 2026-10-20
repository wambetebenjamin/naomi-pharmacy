import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { savePrescription, sendEmail, verifyRecaptcha } from "@/lib/server";

export const runtime = "nodejs";
const detailsSchema = z.object({ patientName: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(30), email: z.string().email().max(200), gpName: z.string().max(120).optional(), notes: z.string().max(1200).optional(), captchaToken: z.string().max(6000).default(""), captchaFallback: z.string().optional() });
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN)) return NextResponse.json({ error: "Secure prescription records are not configured. Please contact our pharmacist." }, { status: 503 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Secure uploads are not configured yet. Please contact our pharmacist on WhatsApp." }, { status: 503 });
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) return NextResponse.json({ error: "Pharmacist notifications are not configured yet. Please contact our team on WhatsApp." }, { status: 503 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Please choose a valid prescription file." }, { status: 400 });
  const parsed = detailsSchema.safeParse({ patientName: form.get("patientName"), phone: form.get("phone"), email: form.get("email"), gpName: form.get("gpName") || "", notes: form.get("notes") || "", captchaToken: form.get("captchaToken") || "", captchaFallback: form.get("captchaFallback") || "false" });
  if (!parsed.success) return NextResponse.json({ error: "Please check your contact details and try again." }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Choose a file smaller than 10 MB." }, { status: 400 });
  const allowed = file.type === "application/pdf" || file.type.startsWith("image/");
  if (!allowed) return NextResponse.json({ error: "Only image files and PDFs are accepted." }, { status: 415 });
  const captcha = await verifyRecaptcha(parsed.data.captchaToken, "prescription_upload", parsed.data.captchaFallback === "true");
  if (!captcha.success) return NextResponse.json({ error: captcha.error || "Security check failed." }, { status: 403 });
  try {
    const reference = `NP-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const blob = await put(`prescriptions/${reference}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, { access: "private", addRandomSuffix: true, contentType: file.type, token: process.env.BLOB_READ_WRITE_TOKEN });
    await savePrescription({ reference, email: parsed.data.email.toLowerCase(), name: parsed.data.patientName, fileUrl: blob.url, createdAt: new Date().toISOString() });
    const pharmacyRecipient = process.env.SMTP_FROM || process.env.SMTP_USER || "hello@naomipharmacy.co.ke";
    await sendEmail({ to: pharmacyRecipient, subject: `Prescription received, ${reference}`, text: `A prescription was uploaded for pharmacist review.\nReference: ${reference}\nPatient: ${parsed.data.patientName}\nPhone: ${parsed.data.phone}\nEmail: ${parsed.data.email}\nGP: ${parsed.data.gpName || "Not supplied"}\nNotes: ${parsed.data.notes || "None"}\nSecure file reference: ${reference}` });
    return NextResponse.json({ reference, status: "received" }, { status: 201 });
  } catch (error) {
    console.error("Prescription upload failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "We could not save your prescription securely. Please try again." }, { status: 500 });
  }
}
