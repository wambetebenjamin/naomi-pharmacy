"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, ChevronDown, Info, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { products } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/Site";

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const product = products.find((item) => item.slug === params.slug);
  const add = useCart((state) => state.add);
  const [quantity, setQuantity] = useState(1);
  const [packSize, setPackSize] = useState(product?.packSize || "");
  const [hasPrescription, setHasPrescription] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { setHasPrescription(Boolean(localStorage.getItem("naomi_prescription_ref"))); }, []);
  if (!product) return <main className="page-main"><div className="container not-found-inline"><span className="pill-illustration">✚</span><h1>This medicine page does not exist.</h1><Link className="button button-primary" href="/shop">Back to Shop</Link></div></main>;
  const handleAdd = () => {
    if (product.rx && !hasPrescription) { setNotice("Upload your prescription so our pharmacist can review this item."); return; }
    for (let i = 0; i < quantity; i += 1) add(product, packSize);
    setNotice("Added to your basket. Thank you.");
  };
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);
  return <main className="page-main"><div className="container"><div className="breadcrumbs"><Link href="/shop"><ArrowLeft size={15} /> Shop</Link><span>/</span><Link href={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div><section className="product-detail"><div className="detail-image"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 780px) 90vw, 48vw" /><span className={product.rx ? "product-pill rx-pill" : "product-pill"}>{product.rx ? "Prescription Required" : "Pharmacist recommended"}</span></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p className="detail-short">{product.description}</p><div className="detail-price">KES {product.price.toLocaleString("en-KE")} <span>incl. VAT</span></div><div className="detail-rule" /><label className="form-label" htmlFor="pack-size">Pack size</label><div className="select-wrap"><select id="pack-size" value={packSize} onChange={(event) => setPackSize(event.target.value)}>{product.options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></div><div className="detail-buy-row"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div><button className="button button-primary detail-add" onClick={handleAdd} disabled={product.rx && !hasPrescription}>Add to basket <Plus size={17} /></button></div>{product.rx && !hasPrescription && <div className="rx-prompt"><Info size={17} /><span>A valid prescription is needed before we can dispense this medicine.</span><Link href="/prescription">Upload prescription <ArrowLeft size={14} /></Link></div>}{notice && <p className="form-success" role="status"><Check size={15} /> {notice}</p>}<div className="detail-trust"><span><ShieldCheck size={18} /> Licensed supply</span><span><Truck size={18} /> Nairobi delivery</span></div></div></section><section className="product-information"><div className="information-main"><span className="eyebrow">Product information</span><h2>Everything to know.</h2><p>{product.description}</p><div className="info-rows"><div><h3>Dosage guidance</h3><p>{product.dosage}</p></div><div><h3>Storage instructions</h3><p>{product.storage}</p></div><div><h3>Side effects note</h3><p>{product.sideEffects}</p></div><div><h3>Manufacturer</h3><p>{product.manufacturer}</p></div></div></div><aside className="care-note"><BadgeCheck size={22} /><h3>A little reassurance</h3><p>Information here is general and does not replace advice from your doctor or pharmacist. Always read the pack label.</p><a href="https://wa.me/254112272061">Ask our pharmacist</a></aside></section>{related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">More in {product.category}</span><h2>You might also like.</h2></div><Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-link">View all <ArrowLeft size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.slug} product={item} />)}</div></section>}</div></main>;
}
