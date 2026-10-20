"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Baby, Bandage, Droplets, HeartPulse, Leaf, Plus, Search, ShieldCheck, ShoppingBag, Truck, UserRound } from "lucide-react";
import { gsap } from "gsap";
import { categories, products, testimonials } from "@/lib/data";
import { ProductCard } from "@/components/Site";

const categoryIcons = [HeartPulse, Leaf, ShieldCheck, Droplets, Baby, UserRound, Bandage, HeartPulse];
const healthTips = [
  { tag: "This week's pharmacist tip", title: "Keep your medicines safely stored", copy: "Store medicines in a cool, dry place, away from little hands. Always check the label for special storage advice.", link: "/health-tips/medicine-storage" },
  { tag: "This week's pharmacist tip", title: "Check before mixing medicines", copy: "Some medicines and supplements can interact. Our pharmacists are a WhatsApp message away if you are unsure.", link: "/health-tips/medicine-safety" },
  { tag: "This week's pharmacist tip", title: "Make time for your daily routine", copy: "A regular reminder can help you stay on track. Follow the advice on your prescription and ask if anything changes.", link: "/health-tips/medicine-routine" },
];

function WeeklyTip() {
  const [index, setIndex] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = window.setInterval(() => {
      gsap.to(copyRef.current, { opacity: 0, y: -8, duration: 0.24, onComplete: () => {
        setIndex((current) => (current + 1) % healthTips.length);
        gsap.fromTo(copyRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 });
      } });
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);
  const tip = healthTips[index];
  return <section className="tip-banner"><div className="tip-icon"><BadgeCheck size={25} /></div><div ref={copyRef} className="tip-content"><span>{tip.tag}</span><h3>{tip.title}</h3><p>{tip.copy}</p></div><Link href={tip.link} className="text-link">Read more <ArrowRight size={16} /></Link><div className="tip-dots" aria-label={`Tip ${index + 1} of ${healthTips.length}`}>{healthTips.map((_, dot) => <button key={dot} aria-label={`Show tip ${dot + 1}`} className={dot === index ? "active" : ""} onClick={() => setIndex(dot)} />)}</div></section>;
}

export default function HomePage() {
  const featured = products.filter((product) => !product.rx).slice(0, 4);
  return <>
    <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><div className="hero-kicker"><span className="kicker-icon"><ShieldCheck size={15} /></span> Nairobi's trusted online pharmacy</div><h1>Your health.<br /><span>Delivered fast.</span></h1><p className="hero-lede">Everyday medicines, expert advice, and a little more peace of mind. Delivered to your Nairobi doorstep, same day.</p><div className="hero-ctas"><Link className="button button-primary button-large" href="/shop">Order Medicine <ArrowRight size={18} /></Link><Link className="button button-outline button-large" href="/prescription">Upload Prescription <span className="upload-arrow">↑</span></Link></div><div className="hero-proof"><div className="proof-avatars"><span>W</span><span>A</span><span>M</span><i><CheckMark /></i></div><p><b>Care from real pharmacists</b><br />Here for you, every day</p></div><form className="hero-search" action="/shop"><Search size={19} /><input name="search" placeholder="Search medicines, vitamins, skincare..." aria-label="Search the shop" /><button aria-label="Search"><ArrowRight size={18} /></button></form></div><div className="hero-visual"><div className="hero-image-frame"><Image src="https://images.pexels.com/photos/30678215/pexels-photo-30678215.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Customers speaking with a pharmacy professional in a Lagos pharmacy" fill priority sizes="(max-width: 900px) 90vw, 50vw" /></div><div className="hero-image-wash" /><div className="delivery-float"><span className="delivery-icon"><Truck size={18} /></span><div><b>Same day delivery</b><small>Across Nairobi</small></div><span className="delivery-live" /></div><div className="licensed-float"><ShieldCheck size={17} /><span>Licensed pharmacy care</span></div><div className="hero-stamp"><span>Care<br />that comes<br /><b>to you.</b></span><i><Plus size={17} /></i></div></div></div><div className="hero-bottom container"><span><span className="status-dot" /> Available across Nairobi</span><span>Quick delivery. Thoughtful care. No guesswork.</span></div></section>

    <section className="section category-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Find what you need</span><h2>Care for every<br className="desktop-break" /> part of your day.</h2></div><Link className="text-link" href="/shop">Shop all categories <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.map((category, index) => { const Icon = categoryIcons[index]; return <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category} className="category-card"><span className="category-icon"><Icon size={20} strokeWidth={1.7} /></span><span>{category}</span><ArrowRight className="category-arrow" size={16} /></Link>; })}</div></div></section>

    <section className="steps-section"><div className="container"><div className="section-heading centered-heading"><div><span className="eyebrow">Good care, made easy</span><h2>Four steps to feeling<br className="desktop-break" /> looked after.</h2></div><p>Everything you need, without the extra trip.</p></div><div className="steps-grid"><article className="step-card"><span className="step-number">01</span><span className="step-icon"><Search size={21} /></span><h3>Find what you need</h3><p>Search the shop, or upload your prescription for our team to review.</p></article><span className="step-dash" /><article className="step-card"><span className="step-number">02</span><span className="step-icon"><ShoppingBagIcon /></span><h3>Add to your basket</h3><p>Choose your essentials. Prescription items are checked by a pharmacist.</p></article><span className="step-dash" /><article className="step-card"><span className="step-number">03</span><span className="step-icon mpesa-icon">M</span><h3>Pay with M-Pesa</h3><p>Secure checkout keeps your delivery details and order together.</p></article><span className="step-dash" /><article className="step-card"><span className="step-number">04</span><span className="step-icon"><Truck size={21} /></span><h3>We bring it to you</h3><p>Our Nairobi delivery team gets your order to your door, same day.</p></article></div></div></section>

    <section className="section featured-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">A few favourites</span><h2>Everyday essentials,<br className="desktop-break" /> thoughtfully chosen.</h2></div><p>OTC products on the homepage. Prescription medicines are available in the shop after pharmacist review.</p></div><div className="product-grid">{featured.map((product, index) => <ProductCard key={product.slug} product={product} staggerIndex={index} />)}</div><div className="center-action"><Link className="button button-outline" href="/shop">Explore the full shop <ArrowRight size={17} /></Link></div></div></section>

    <section className="section why-section" id="about"><div className="container why-grid"><div className="why-photo"><Image src="https://images.pexels.com/photos/19471015/pexels-photo-19471015.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Pharmacist using a phone to support a customer" fill sizes="(max-width: 800px) 90vw, 40vw" /><div className="photo-caption"><span className="caption-check"><CheckMark /></span><span><b>Good advice, always close.</b><small>Our pharmacists are here to help.</small></span></div><span className="photo-label">PERSONAL CARE, EVERY STEP</span></div><div className="why-copy"><span className="eyebrow">Care you can count on</span><h2>More than a delivery.<br />A team in your corner.</h2><p className="why-intro">Medicines matter. So does knowing where they come from, how to take them, and who to ask when something is not quite clear.</p><ul className="benefit-list"><li><span><ShieldCheck size={18} /></span><div><b>Licensed and regulated</b><small>Dispensed with professional care and local standards in mind.</small></div></li><li><span><BadgeCheck size={18} /></span><div><b>Genuine medicines only</b><small>Sourced through trusted, verified supply partners.</small></div></li><li><span><MessageIcon /></span><div><b>A pharmacist on WhatsApp</b><small>Real answers for medicine and prescription questions.</small></div></li><li><span><Truck size={18} /></span><div><b>Free delivery above KES 1,500</b><small>Enjoy discreet packaging on every delivery.</small></div></li></ul><Link href="/shop" className="text-link">Meet your pharmacy <ArrowRight size={16} /></Link></div></div></section>

    <section className="section tip-section"><div className="container"><WeeklyTip /></div></section>

    <section className="testimonial-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Kind words from Nairobi</span><h2>Care that feels<br className="desktop-break" /> a little closer.</h2></div><div className="review-score"><b>4.9</b><span><i>Excellent care</i><small>Trusted by our community</small></span></div></div><div className="testimonial-grid">{testimonials.map((item, index) => <article className="testimonial-card" key={item.name}><div className="review-label">Rated 5 out of 5</div><p>“{item.quote}”</p><div className="reviewer"><span className={`review-avatar avatar-${index}`}>{item.name[0]}</span><div><b>{item.name}</b><small>{item.location}, Nairobi</small></div><CheckMark /></div></article>)}</div></div></section>

    <section className="bottom-cta"><div className="container bottom-cta-inner"><span className="cta-icon"><HeartPulse size={23} /></span><div><span className="eyebrow">Your next delivery is a few clicks away</span><h2>Let's make looking after you easier.</h2></div><Link className="button button-primary button-large" href="/shop">Shop medicines <ArrowRight size={17} /></Link></div></section>
  </>;
}

function CheckMark() { return <span className="check-mark"><span>✓</span></span>; }
function ShoppingBagIcon() { return <span className="bag-icon-small"><ShoppingBag size={20} /></span>; }
function MessageIcon() { return <span className="message-icon">◌</span>; }
