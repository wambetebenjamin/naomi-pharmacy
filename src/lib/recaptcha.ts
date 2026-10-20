"use client";

let loading: Promise<void> | undefined;

declare global {
  interface Window { grecaptcha?: { ready: (callback: () => void) => void; execute: (key: string, options: { action: string }) => Promise<string>; render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void }) => number } }
}

export async function getCaptchaToken(action: string): Promise<string> {
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!key || typeof window === "undefined") return "";
  if (!window.grecaptcha) {
    loading ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load reCAPTCHA."));
      document.head.appendChild(script);
    });
    await loading;
  }
  return new Promise((resolve, reject) => window.grecaptcha!.ready(() => window.grecaptcha!.execute(key, { action }).then(resolve, reject)));
}
