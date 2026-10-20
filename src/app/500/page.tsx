"use client";

import Link from "next/link";
import { MessageCircle, RefreshCcw } from "lucide-react";
export default function ServerErrorPage() { return <main className="page-main error-page"><div className="container error-card"><span className="error-pill">500</span><span className="eyebrow">A small hiccup</span><h1>We are getting things back on track.</h1><p>Please give us a moment, then try again. Our pharmacy team is happy to help in the meantime.</p><div className="error-actions"><button className="button button-primary" onClick={() => window.location.reload()}><RefreshCcw size={16} /> Try Again</button><a className="button button-outline" href="https://wa.me/254112272061"><MessageCircle size={16} /> WhatsApp +254112272061</a></div><Link href="/" className="error-home">Back to the home page</Link></div></main>; }
