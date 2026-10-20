"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/data";

export function Header() {
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const count = useCart((state) => state.items.reduce((sum, line) => sum + line.quantity, 0));
  const nav = [["Shop", "/shop"], ["Prescription", "/prescription"], ["Health tips", "/health-tips"], ["About", "/#about"]];
  return <>
    <div className="top-strip"><div className="container top-strip-inner"><span><i className="status-dot" /> Nairobi delivery, made simple</span><span className="top-note">Licensed pharmacy care, right to your door</span><a href="tel:+254112272061">Need help? +254 112 272 061</a></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="brand" aria-label="Naomi Pharmacy home"><span className="brand-mark"><Plus size={22} strokeWidth={3} /></span><span>naomi<span className="brand-pharmacy">pharmacy</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, href]) => <Link key={href} href={href} className={pathname === href ? "nav-active" : ""}>{label}</Link>)}</nav>
      <div className="header-actions"><Link href="/auth/signin" className="account-link">Sign in</Link><button type="button" className="bag-link bag-trigger" aria-label={`Open cart with ${count} items`} onClick={() => window.dispatchEvent(new Event("naomi-open-cart"))}><ShoppingBag size={19} /><span>Cart</span>{count > 0 && <b>{count}</b>}</button><button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setMobile(!mobile)}>{mobile ? <X /> : <Menu />}</button></div>
    </div>
    <AnimatePresence>{mobile && <motion.nav className="mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} aria-label="Mobile navigation">{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobile(false)}>{label}<ArrowRight size={17} /></Link>)}<Link href="/auth/signin" onClick={() => setMobile(false)}>Sign in<ArrowRight size={17} /></Link></motion.nav>}</AnimatePresence></header>
  </>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark"><Plus size={22} strokeWidth={3} /></span><span>naomi<span className="brand-pharmacy">pharmacy</span></span></Link><p>Your health. Delivered fast. Trusted pharmacy care, delivered across Nairobi.</p><a className="footer-phone" href="https://wa.me/254112272061">Talk to a pharmacist <ArrowRight size={15} /></a></div><div className="footer-links"><div><strong>Shop</strong><Link href="/shop">All medicines</Link><Link href="/prescription">Upload a prescription</Link><Link href="/cart">Your basket</Link></div><div><strong>Helpful</strong><Link href="/health-tips">Health tips</Link><Link href="/my-orders">Track an order</Link><Link href="/contact">Contact us</Link></div><div><strong>Our policies</strong><Link href="/legal/privacy-policy">Privacy policy</Link><Link href="/legal/terms">Terms of service</Link><Link href="/legal/cookie-policy">Cookie policy</Link></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Naomi Pharmacy. Nairobi, Kenya.</span><span>Licensed pharmacy care. Your wellbeing comes first.</span></div></div></footer>;
}

export function ProductCard({ product, onAdded, staggerIndex = 0 }: { product: Product; onAdded?: () => void; staggerIndex?: number }) {
  const add = useCart((state) => state.add);
  return <motion.article className="product-card" layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} whileHover={{ y: -5 }} transition={{ duration: 0.24, delay: staggerIndex * 0.055 }}>
    <Link href={`/shop/${product.slug}`} className="product-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 680px) 80vw, (max-width: 1050px) 40vw, 25vw" /><span className={`product-pill ${product.rx ? "rx-pill" : ""}`}>{product.rx ? "Prescription Required" : product.category}</span></Link>
    <div className="product-info"><Link href={`/shop/${product.slug}`}><h3>{product.name}</h3></Link><span className="pack-size">{product.packSize}</span><div className="product-buy"><strong>KES {product.price.toLocaleString("en-KE")}</strong><button className="add-button" disabled={product.rx} onClick={() => { add(product); onAdded?.(); }} aria-label={product.rx ? "Add to cart disabled until prescription is uploaded" : `Add ${product.name} to cart`}><Plus size={18} /></button></div>{product.rx && <Link className="rx-link" href="/prescription">Upload prescription to order</Link>}</div>
  </motion.article>;
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const listener = () => setOpen(true);
    window.addEventListener("naomi-open-cart", listener);
    return () => window.removeEventListener("naomi-open-cart", listener);
  }, []);
  const items = useCart((state) => state.items);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const total = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <>
    <AnimatePresence>{open && <><motion.button className="drawer-backdrop" aria-label="Close basket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} /><motion.aside className="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 250 }} aria-label="Your basket"><div className="drawer-head"><div><span className="eyebrow">Your basket</span><h2>Ready when you are</h2></div><button className="icon-button" aria-label="Close basket" onClick={() => setOpen(false)}><X /></button></div>{items.length === 0 ? <div className="empty-state"><span className="empty-icon"><ShoppingBag /></span><h3>Your basket is empty</h3><p>Find your everyday essentials in our catalogue.</p><Link className="button button-primary" href="/shop" onClick={() => setOpen(false)}>Browse shop <ArrowRight size={16} /></Link></div> : <><div className="drawer-items">{items.map(({ product, quantity, packSize }) => <div className="drawer-item" key={product.slug}><div className="drawer-product-photo"><Image src={product.image} alt="" fill sizes="72px" /></div><div className="drawer-item-info"><Link href={`/shop/${product.slug}`} onClick={() => setOpen(false)}>{product.name}</Link><small>{packSize}</small><b>KES {(product.price * quantity).toLocaleString("en-KE")}</b></div><div className="quantity-control compact"><button aria-label="Decrease quantity" onClick={() => setQuantity(product.slug, quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(product.slug, quantity + 1)}><Plus size={14} /></button></div><button className="remove-line" onClick={() => remove(product.slug)} aria-label={`Remove ${product.name}`}><X size={15} /></button></div>)}</div><div className="drawer-total"><span>Subtotal</span><strong>KES {total.toLocaleString("en-KE")}</strong></div><p className="drawer-delivery">Delivery is calculated at checkout.</p><div className="drawer-actions"><Link href="/cart" className="button button-outline" onClick={() => setOpen(false)}>View full basket</Link><Link href="/checkout" className="button button-primary" onClick={() => setOpen(false)}>Proceed to checkout <ArrowRight size={17} /></Link></div></>}</motion.aside></>}</AnimatePresence>
  </>;
}

export function PageTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>;
}
