"use client";

import { useEffect, useRef } from "react";


export function CaptchaFallback({ visible, onToken }: { visible: boolean; onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  useEffect(() => {
    if (!visible || !container.current || rendered.current) return;
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!key) return;
    const mount = () => {
      if (!container.current || !window.grecaptcha?.render || rendered.current) return;
      window.grecaptcha.render(container.current, { sitekey: key, callback: onToken, "expired-callback": () => onToken("") });
      rendered.current = true;
    };
    const timer = window.setInterval(() => { if (window.grecaptcha?.render) { window.clearInterval(timer); mount(); } }, 300);
    const stop = window.setTimeout(() => window.clearInterval(timer), 12000);
    return () => { window.clearInterval(timer); window.clearTimeout(stop); };
  }, [visible, onToken]);
  return visible ? <div className="captcha-fallback"><p>Please complete the reCAPTCHA check to continue.</p><div ref={container} /></div> : null;
}
