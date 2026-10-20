"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FileText, ShieldCheck, Upload, X } from "lucide-react";
import { PageTitle } from "@/components/Site";
import SuccessTick from "@/components/SuccessTick";
import { getCaptchaToken } from "@/lib/recaptcha";
import { CaptchaFallback } from "@/components/CaptchaFallback";

type Status = "idle" | "uploading" | "success" | "error";
export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState(false);
  const [fallbackToken, setFallbackToken] = useState("");
  const [data, setData] = useState({ patientName: "", phone: "", email: "", gpName: "", notes: "" });
  const update = (key: keyof typeof data, value: string) => setData((current) => ({ ...current, [key]: value }));

  async function sendFile(token: string, isFallback = false) {
    if (!file) return;
    setStatus("uploading"); setError(""); setProgress(5);
    const form = new FormData();
    form.append("file", file); form.append("patientName", data.patientName); form.append("phone", data.phone); form.append("email", data.email); form.append("gpName", data.gpName); form.append("notes", data.notes); form.append("captchaToken", token); form.append("captchaFallback", String(isFallback));
    const request = new XMLHttpRequest();
    request.open("POST", "/api/prescription/upload");
    request.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.min(94, Math.round((event.loaded / event.total) * 100))); };
    request.onload = () => {
      const result = JSON.parse(request.responseText || "{}");
      if (request.status >= 200 && request.status < 300) {
        setProgress(100); setReference(result.reference); setStatus("success"); localStorage.setItem("naomi_prescription_ref", result.reference); setFallback(false);
      } else { setStatus("error"); setError(result.error || "We could not upload your prescription. Please try again or contact our pharmacist."); }
    };
    request.onerror = () => { setStatus("error"); setError("Connection interrupted. Please try again."); };
    request.send(form);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Please choose an image or PDF of your prescription."); return; }
    try {
      const token = await getCaptchaToken("prescription_upload");
      if (!token && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) { setError("Could not start the security check. Please try again."); return; }
      if (token) {
        const response = await fetch("/api/recaptcha/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: "prescription_upload" }) });
        const result = await response.json();
        if (result.fallbackRequired) { setFallback(true); setError("Please complete the extra check below."); return; }
        if (!result.success) { setError(result.error || "Security check failed. Please try again."); return; }
      }
      await sendFile(token);
    } catch { setStatus("error"); setError("The security check could not be completed. Please try again."); }
  }

  return <main className="page-main"><div className="container prescription-layout"><div className="prescription-intro"><PageTitle eyebrow="A secure start" title="Your prescription, in safe hands." description="Send it to our pharmacy team for a confidential review. We will contact you if we need anything else." /><div className="prescription-benefits"><div><span><ShieldCheck size={19} /></span><div><b>Private and protected</b><small>Your health information is only used to process this request.</small></div></div><div><span><FileText size={19} /></span><div><b>Images or PDF</b><small>Clear photos of each page help us review your prescription.</small></div></div><div><span><Upload size={19} /></span><div><b>Reviewed by a pharmacist</b><small>We verify prescriptions before dispensing prescription medicines.</small></div></div></div><div className="prescription-help"><b>Need a hand?</b><p>Message a pharmacist on WhatsApp for help with your upload.</p><a href="https://wa.me/254112272061">Chat with our team <span>↗</span></a></div></div><form className="prescription-form form-card" onSubmit={submit}><div className="form-card-heading"><div><span className="eyebrow">Prescription details</span><h2>Let's get started.</h2></div><span className="secure-label"><ShieldCheck size={14} /> Secure</span></div>{status === "success" ? <div className="upload-success"><SuccessTick animated /><span className="eyebrow">Received by our team</span><h3>Thank you, {data.patientName.split(" ")[0]}.</h3><p>Your prescription reference is <b>{reference}</b>. We will review it and contact you soon.</p><Link className="button button-primary" href="/shop">Continue shopping</Link></div> : <>
      <div className="form-grid"><label className="field"><span>Patient name *</span><input required autoComplete="name" value={data.patientName} onChange={(event) => update("patientName", event.target.value)} placeholder="Full name" /></label><label className="field"><span>Phone number *</span><input required type="tel" autoComplete="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+254 7XX XXX XXX" /></label><label className="field"><span>Email address *</span><input required type="email" autoComplete="email" value={data.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" /></label><label className="field"><span>Prescribing doctor or GP</span><input value={data.gpName} onChange={(event) => update("gpName", event.target.value)} placeholder="Clinician name" /></label></div>
      <label className="field notes-field"><span>Notes for the pharmacist</span><textarea rows={3} value={data.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Anything our pharmacy team should know?" /></label>
      <label className={`upload-dropzone ${file ? "has-file" : ""}`}><input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => { const selected = event.target.files?.[0] || null; if (selected && selected.size > 10 * 1024 * 1024) { setError("Files must be smaller than 10 MB."); return; } setFile(selected); setError(""); }} /><span className="upload-icon"><Upload size={19} /></span><span><b>{file ? file.name : "Drop your prescription here"}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB, ready to upload` : "Choose a photo or PDF, up to 10 MB"}</small></span>{file && <button type="button" className="remove-upload" aria-label="Remove file" onClick={(event) => { event.preventDefault(); setFile(null); }}><X size={16} /></button>}</label>
      {status === "uploading" && <div className="upload-progress-wrap"><div className="upload-progress-copy"><span>Uploading securely</span><b>{progress}%</b></div><div className="upload-progress"><span style={{ width: `${progress}%` }} /></div></div>}
      <CaptchaFallback visible={fallback} onToken={setFallbackToken} />
      {fallback && <button type="button" className="button button-primary button-wide fallback-submit" disabled={!fallbackToken} onClick={() => sendFile(fallbackToken, true)}>Continue securely</button>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!fallback && <button className="button button-primary button-wide" type="submit" disabled={status === "uploading"}><span>{status === "uploading" ? "Uploading..." : "Send for pharmacist review"}</span><Upload size={17} /></button>}
      <p className="form-privacy">By sending your prescription, you agree to our <Link href="/legal/privacy-policy">privacy policy</Link>. We handle your health details with care.</p>
    </>}</form></div></main>;
}
