"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { PageTitle } from "@/components/Site";
import { getCaptchaToken } from "@/lib/recaptcha";
import { CaptchaFallback } from "@/components/CaptchaFallback";

const zones = [{ name: "Central Nairobi", fee: 250 }, { name: "Westlands and Parklands", fee: 300 }, { name: "Kilimani and Lavington", fee: 300 }, { name: "Eastlands and Embakasi", fee: 350 }, { name: "Greater Nairobi", fee: 500 }];
const slots = ["As soon as possible", "Morning, 8am to 12pm", "Afternoon, 12pm to 4pm", "Evening, 4pm to 8pm"];
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const [zone, setZone] = useState(zones[0].name);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", slot: slots[0], prescriptionReference: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [fallbackToken, setFallbackToken] = useState("");
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [items]);
  const deliveryFee = subtotal >= 1500 ? 0 : zones.find((item) => item.name === zone)?.fee ?? 250;
  const hasRx = items.some((item) => item.product.rx);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function placeOrder(captchaToken: string, fallbackCaptcha = false) {
    setSending(true); setError("");
    const payload = { ...form, zone, deliveryFee, items: items.map((item) => ({ slug: item.product.slug, quantity: item.quantity, packSize: item.packSize })), captchaToken, captchaFallback: fallbackCaptcha };
    try {
      const response = await fetch("/api/orders/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "We could not place your order. Please check your details."); setSending(false); return; }
      localStorage.setItem("naomi_last_order", JSON.stringify({ ref: result.reference, name: form.name, zone, slot: form.slot, subtotal, deliveryFee, total: subtotal + deliveryFee, items: items.map((item) => ({ ...item, quantity: item.quantity })) }));
      const orderRefs = JSON.parse(localStorage.getItem("naomi_order_refs") || "[]") as string[];
      localStorage.setItem("naomi_order_refs", JSON.stringify([result.reference, ...orderRefs.filter((ref) => ref !== result.reference)]));
      router.push(`/order-confirmation?ref=${encodeURIComponent(result.reference)}`);
    } catch { setError("A connection issue stopped your order. Please try again."); setSending(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!items.length) return;
    if (hasRx && !form.prescriptionReference.trim()) { setError("Please add your prescription reference before ordering prescription medicines."); return; }
    setSending(true); setError("");
    try {
      const token = await getCaptchaToken("checkout");
      if (!token && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) { setError("Could not start the security check. Please try again."); setSending(false); return; }
      if (token) {
        const check = await fetch("/api/recaptcha/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "checkout" }) });
        const result = await check.json();
        if (result.fallbackRequired) { setFallback(true); setSending(false); return; }
        if (!result.success) { setError(result.error || "Security check failed. Please try again."); setSending(false); return; }
      }
      await placeOrder(token);
    } catch { setSending(false); setError("The security check could not be completed. Please try again."); }
  }
  return <main className="page-main"><div className="container"><PageTitle eyebrow="Delivery and payment" title="One more step, then you're set." description="Tell us where to deliver. Our pharmacy team will confirm your M-Pesa payment instructions with your order." />{!items.length ? <div className="empty-cart"><p>Your basket is empty.</p><Link href="/shop" className="button button-primary">Go to the shop</Link></div> : <form className="checkout-layout" onSubmit={submit}><section className="checkout-details"><div className="form-card"><span className="eyebrow">01, Delivery details</span><h2>Where should we bring it?</h2><div className="form-grid"><label className="field"><span>Full name *</span><input required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your full name" /></label><label className="field"><span>Phone number *</span><input required type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+254 7XX XXX XXX" /></label><label className="field"><span>Email address</span><input type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></label><label className="field"><span>Delivery zone *</span><select value={zone} onChange={(event) => setZone(event.target.value)}>{zones.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label></div><label className="field notes-field"><span>Delivery address *</span><textarea required rows={3} autoComplete="street-address" value={form.address} onChange={(event) => update("address", event.target.value)} placeholder="Building, street, estate, and a nearby landmark" /></label><label className="field"><span>Preferred time slot</span><select value={form.slot} onChange={(event) => update("slot", event.target.value)}>{slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label></div><div className="form-card payment-card"><span className="eyebrow">02, Payment</span><h2>Pay securely with M-Pesa.</h2><div className="mpesa-choice"><span className="mpesa-logo">M</span><div><b>M-Pesa mobile payment</b><small>Our pharmacy team will confirm the payment instructions with your order update.</small></div><span className="radio-selected" /></div>{hasRx && <label className="field prescription-ref"><span>Prescription reference *</span><input required value={form.prescriptionReference} onChange={(event) => update("prescriptionReference", event.target.value)} placeholder="For example, NP-2026-AB123" /><small>Upload a prescription first if you have not already.</small></label>}{error && <p className="form-error" role="alert">{error}</p>}<CaptchaFallback visible={fallback} onToken={setFallbackToken} />{fallback && <button type="button" className="button button-primary button-wide" disabled={!fallbackToken || sending} onClick={() => placeOrder(fallbackToken, true)}>Continue securely</button>}{!fallback && <button className="button button-primary button-wide" type="submit" disabled={sending}>{sending ? "Preparing your order..." : "Place order"} <ArrowRight size={17} /></button>}<p className="form-privacy"><ShieldCheck size={14} /> Your payment is handled securely through M-Pesa.</p></div></section><aside className="order-summary checkout-summary"><span className="eyebrow">Order summary</span><h2>Your essentials.</h2><div className="checkout-items">{items.map(({ product, quantity, packSize }) => <div className="checkout-item" key={product.slug}><span className="checkout-thumb"><Image src={product.image} alt="" fill sizes="54px" /></span><span><b>{product.name}</b><small>{packSize}, Qty {quantity}</small></span><strong>KES {(product.price * quantity).toLocaleString("en-KE")}</strong></div>)}</div><div className="summary-row"><span>Subtotal</span><b>KES {subtotal.toLocaleString("en-KE")}</b></div><div className="summary-row"><span>Delivery</span><b>{deliveryFee ? `KES ${deliveryFee}` : "Free"}</b></div><div className="summary-row summary-total"><span>Total</span><b>KES {(subtotal + deliveryFee).toLocaleString("en-KE")}</b></div><p className="summary-secure"><ShieldCheck size={15} /> Licensed pharmacy care, delivered discreetly.</p><Link href="/cart" className="text-link">Edit basket <ArrowRight size={15} /></Link></aside></form>}</div></main>;
}
