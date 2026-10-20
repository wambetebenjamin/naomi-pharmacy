"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { PageTitle } from "@/components/Site";
import { CaptchaFallback } from "@/components/CaptchaFallback";
import { getCaptchaToken } from "@/lib/recaptcha";

export default function ContactPage() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [fallback, setFallback] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  async function send(token: string, isFallback = false) {
    setSending(true); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, captchaToken: token, captchaFallback: isFallback }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Your message could not be sent."); setSending(false); return; }
      setNotice("Thank you. Your message has been sent to our pharmacy team."); setFields({ name: "", email: "", message: "" }); setFallback(false); setSending(false);
    } catch { setError("We could not reach the pharmacy team. Please try WhatsApp instead."); setSending(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setError("");
    try {
      const token = await getCaptchaToken("contact");
      if (!token && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) { setError("Could not start the security check. Please try again."); setSending(false); return; }
      if (token) {
        const response = await fetch("/api/recaptcha/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "contact" }) });
        const result = await response.json();
        if (result.fallbackRequired) { setFallback(true); setSending(false); return; }
        if (!result.success) { setError(result.error || "Security check failed."); setSending(false); return; }
      }
      await send(token);
    } catch { setError("The security check could not be completed."); setSending(false); }
  }
  return <main className="page-main"><div className="container contact-layout"><div><PageTitle eyebrow="Here when you need us" title="Talk to a real pharmacist." description="Questions about an order, prescription, or product? Send us a note or speak with our team on WhatsApp." /><div className="contact-method"><span><MessageCircle size={19} /></span><div><b>Quickest way to reach us</b><small>Chat with a pharmacist on WhatsApp</small><a href="https://wa.me/254112272061">+254 112 272 061</a></div></div><div className="contact-method"><span><ShieldCheck size={19} /></span><div><b>Local pharmacy care</b><small>Serving Nairobi, Kenya</small><a href="mailto:hello@naomipharmacy.co.ke">hello@naomipharmacy.co.ke</a></div></div></div><form className="form-card contact-form" onSubmit={submit}><span className="eyebrow">Send us a message</span><h2>How can we help?</h2><label className="field"><span>Your name *</span><input required value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} autoComplete="name" placeholder="Full name" /></label><label className="field"><span>Email address *</span><input required type="email" value={fields.email} onChange={(event) => setFields({ ...fields, email: event.target.value })} autoComplete="email" placeholder="you@example.com" /></label><label className="field"><span>Your message *</span><textarea required minLength={10} rows={5} value={fields.message} onChange={(event) => setFields({ ...fields, message: event.target.value })} placeholder="Tell us what you need help with" /></label><CaptchaFallback visible={fallback} onToken={setCaptcha} />{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}{fallback ? <button type="button" className="button button-primary button-wide" disabled={!captcha || sending} onClick={() => send(captcha, true)}>Send message securely</button> : <button className="button button-primary button-wide" disabled={sending}>{sending ? "Sending..." : "Send message"}</button>}<p className="form-privacy"><ShieldCheck size={14} /> Your message is handled confidentially.</p></form></div></main>;
}
