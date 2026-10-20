"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Volume2, VolumeX, X } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Lenis from "lenis";
import { getCaptchaToken } from "@/lib/recaptcha";

const consentKey = "naomi_pharmacy_consent";

type Consent = { necessary: true; functional: boolean; analytics: boolean; marketing: boolean };

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const count = window.setInterval(() => setProgress(Math.min(100, Math.round(((Date.now() - started) / 2500) * 100))), 35);
    const skip = window.setTimeout(() => setSkipVisible(true), 1000);
    const hide = window.setTimeout(() => setVisible(false), 2600);
    return () => { window.clearInterval(count); window.clearTimeout(skip); window.clearTimeout(hide); };
  }, []);
  return <AnimatePresence>{visible && <motion.div className="preloader" role="status" aria-live="polite" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
    <span className="spinner" aria-hidden="true" /><span className="loader-percent">{progress}%</span>
    {skipVisible && <button className="loader-skip" onClick={() => setVisible(false)}>Skip</button>}
  </motion.div>}</AnimatePresence>;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);
  return null;
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [settings, setSettings] = useState<Consent>({ necessary: true, functional: false, analytics: false, marketing: false });
  useEffect(() => { if (!localStorage.getItem(consentKey)) setOpen(true); }, []);
  const save = (all: boolean) => {
    const consent: Consent = { necessary: true, functional: all || settings.functional, analytics: all || settings.analytics, marketing: all || settings.marketing };
    localStorage.setItem(consentKey, JSON.stringify(consent));
    window.dispatchEvent(new Event("naomi-consent-updated"));
    setOpen(false); setManage(false);
  };
  return <>
    <AnimatePresence>{open && <motion.aside className="cookie-banner" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} aria-label="Cookie consent">
      <div className="cookie-copy"><Cookie size={19} /><div><strong>Your privacy matters</strong><p>We use essential storage to make this site work. Choose whether to allow optional analytics and personalisation. Read our <a href="/legal/cookie-policy">cookie policy</a>.</p></div></div>
      <div className="cookie-actions"><button className="button button-soft" onClick={() => setManage(true)}>Manage Preferences</button><button className="button button-primary" onClick={() => save(true)}>Accept All</button></div>
    </motion.aside>}</AnimatePresence>
    <AnimatePresence>{manage && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setManage(false)}>
      <motion.section className="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consent-title" initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }}>
        <button className="icon-button modal-close" aria-label="Close preferences" onClick={() => setManage(false)}><X size={19} /></button><span className="eyebrow">Privacy settings</span><h2 id="consent-title">Choose your preferences</h2><p>Necessary storage keeps the basket and core services working. Optional choices can be changed at any time.</p>
        {(["necessary", "functional", "analytics", "marketing"] as const).map((key) => <label className="consent-choice" key={key}><span><b>{key[0].toUpperCase() + key.slice(1)}</b><small>{key === "necessary" ? "Required for the site to work" : `Optional ${key} cookies`}</small></span><input type="checkbox" checked={settings[key]} disabled={key === "necessary"} onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })} /></label>)}
        <button className="button button-primary button-wide" onClick={() => save(false)}>Save preferences</button>
      </motion.section>
    </motion.div>}</AnimatePresence>
  </>;
}

const tourScript = "Hey, welcome to Naomi Pharmacy. Getting your medicine in Nairobi just got a whole lot easier. Search for what you need, upload your prescription if required, pay with M-Pesa, and we deliver straight to your door, same day. Our licensed pharmacists are always on call if you have questions. Shop now and take care of yourself.";
export function VoiceTour() {
  const [speaking, setSpeaking] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const tourState = useRef({ started: false, speaking: false });
  tourState.current = { started, speaking };
  const play = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voice = new SpeechSynthesisUtterance(tourScript);
    voice.rate = 0.95; voice.pitch = 1.1; voice.lang = "en-KE";
    voice.onstart = () => setSpeaking(true);
    voice.onend = () => { setSpeaking(false); setStarted(true); };
    voice.onerror = () => { setSpeaking(false); setStarted(true); };
    utterance.current = voice; setMuted(false); window.speechSynthesis.speak(voice);
  }, []);
  useEffect(() => {
    const trigger = (event: Event) => {
      if (event.type === "click" && (event.target as HTMLElement | null)?.closest(".voice-button")) return;
      if (!tourState.current.started && !tourState.current.speaking) play();
    };
    window.addEventListener("scroll", trigger, { once: true, passive: true });
    window.addEventListener("click", trigger, { once: true });
    return () => { window.removeEventListener("scroll", trigger); window.removeEventListener("click", trigger); };
  }, [play]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  return <div className="voice-tour-wrap"><span className="tour-tooltip">{started ? "Replay tour" : "Hear what this site is about"}</span><button className={`floating-button voice-button ${speaking ? "is-speaking" : ""}`} aria-label="Site voice tour, click to mute" title={started ? "Replay tour" : "Hear what this site is about"} onClick={() => { if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); setMuted(true); } else { setMuted(false); play(); } }}>{muted ? <VolumeX /> : <Volume2 />}</button></div>;
}

export function WhatsappButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254112272061";
  const message = "Hello Naomi Pharmacy, I would like to order medicine or ask about a prescription.";
  return <a className="floating-button whatsapp-button" href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label="Chat with our pharmacist on WhatsApp" title="Chat with our pharmacist on WhatsApp"><i className="fa fa-whatsapp whatsapp-glyph" aria-hidden="true" /></a>;
}

export function AnalyticsConsent() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const read = () => {
      try { setEnabled(Boolean(JSON.parse(localStorage.getItem(consentKey) || "null")?.analytics)); }
      catch { setEnabled(false); }
    };
    read();
    window.addEventListener("naomi-consent-updated", read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener("naomi-consent-updated", read); window.removeEventListener("storage", read); };
  }, []);
  return enabled ? <><Analytics /><SpeedInsights /></> : null;
}
