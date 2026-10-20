"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CaptchaFallback } from "@/components/CaptchaFallback";
import { getCaptchaToken } from "@/lib/recaptcha";

const signInSchema = z.object({ email: z.string().email("Enter a valid email address.") });
const signUpSchema = z.object({ name: z.string().min(2, "Enter your full name."), email: z.string().email("Enter a valid email address.") });
type FormValues = { name?: string; email: string };
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState(false);
  const [fallbackToken, setFallbackToken] = useState("");
  const schema = isSignUp ? signUpSchema : signInSchema;
  const doGoogle = async (email?: string, captchaToken?: string, fallbackCaptcha = false) => {
    try {
      const token = captchaToken ?? await getCaptchaToken(isSignUp ? "signup" : "signin");
      if (token) {
        const response = await fetch("/api/recaptcha/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, action: isSignUp ? "signup" : "signin", fallback: fallbackCaptcha }) });
        const result = await response.json();
        if (result.fallbackRequired) { setFallback(true); setMessage("Complete the extra security check below."); return; }
        if (!result.success) { setMessage(result.error || "Security check failed. Please try again."); return; }
      }
      if (fallback && !fallbackCaptcha) return;
      if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !captchaToken) { setMessage("Security verification is not configured yet. Please contact our team."); return; }
      await signIn("google", { callbackUrl: "/my-orders", ...(email ? { login_hint: email } : {}) });
    } catch { setMessage("We could not start sign-in. Please try again."); }
  };
  const onSubmit = handleSubmit(async (values) => {
    setMessage("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) { parsed.error.issues.forEach((issue) => setError(issue.path[0] as keyof FormValues, { message: issue.message })); return; }
    await doGoogle(values.email);
  });
  return <main className="auth-page"><div className="auth-visual"><div className="auth-image" /><div className="auth-visual-copy"><span className="eyebrow">Naomi Pharmacy, Nairobi</span><h2>Care that meets you where you are.</h2><p>Your prescriptions, medicine advice, and order history, all together.</p></div></div><div className="auth-panel"><div className="auth-form-wrap"><Link href="/" className="brand"><span className="brand-mark"><span>+</span></span><span>naomi<span className="brand-pharmacy">pharmacy</span></span></Link><span className="eyebrow">{isSignUp ? "Welcome to Naomi" : "Good to see you again"}</span><h1>{isSignUp ? "Create your account." : "Sign in to your account."}</h1><p className="auth-subtitle">{isSignUp ? "Save your details and keep track of the care you need." : "See your orders and manage your pharmacy details."}</p><form onSubmit={onSubmit} className="auth-form">{isSignUp && <label className="field"><span>Full name</span><input autoComplete="name" {...register("name")} placeholder="Your name" />{errors.name && <small className="field-error">{errors.name.message}</small>}</label>}<label className="field"><span>Email address</span><input type="email" autoComplete="email" {...register("email")} placeholder="you@example.com" />{errors.email && <small className="field-error">{errors.email.message}</small>}</label><p className="auth-privacy"><ShieldCheck size={15} /> Secure sign-in with Google. We do not store your password.</p><CaptchaFallback visible={fallback} onToken={setFallbackToken} />{message && <p className="form-error" role="alert">{message}</p>}{fallback ? <button className="button button-primary button-wide" type="button" disabled={!fallbackToken || isSubmitting} onClick={() => doGoogle(undefined, fallbackToken, true)}>Continue with Google <ArrowRight size={16} /></button> : <button className="button button-primary button-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? "Checking..." : "Continue with Google"} <ArrowRight size={16} /></button>}</form><div className="auth-switch">{isSignUp ? "Already have an account?" : "New to Naomi Pharmacy?"} <Link href={isSignUp ? "/auth/signin" : "/auth/signup"}>{isSignUp ? "Sign in" : "Create an account"}</Link></div><Link className="auth-shop-link" href="/shop">Continue shopping without an account</Link></div></div></main>;
}
