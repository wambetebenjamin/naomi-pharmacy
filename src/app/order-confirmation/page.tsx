"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, MessageCircle, PackageCheck, Truck } from "lucide-react";
import SuccessTick from "@/components/SuccessTick";
import { jsPDF } from "jspdf";

type Order = { ref: string; name: string; phone: string; address: string; zone: string; slot: string; total: number; items: { product: { name: string; price: number }; quantity: number; packSize: string }[] };
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    const reference = searchParams.get("ref");
    try {
      const saved = localStorage.getItem("naomi_last_order");
      if (saved) {
        const parsed = JSON.parse(saved) as Order;
        if (!reference || parsed.ref === reference) { setOrder(parsed); return; }
      }
    } catch { setOrder(null); }
    if (reference) fetch(`/api/orders/${encodeURIComponent(reference)}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((value) => { if (value) setOrder(value as Order); }).catch(() => undefined);
  }, [searchParams]);
  const ref = searchParams.get("ref") || order?.ref || "Pending confirmation";
  const download = () => {
    const pdf = new jsPDF();
    pdf.setTextColor(36, 76, 253); pdf.setFontSize(22); pdf.text("Naomi Pharmacy", 20, 24);
    pdf.setTextColor(35, 47, 57); pdf.setFontSize(12); pdf.text("Order receipt", 20, 36); pdf.text(`Reference: ${ref}`, 20, 48);
    let y = 66;
    order?.items.forEach(({ product, quantity, packSize }) => { pdf.text(`${product.name} (${packSize}) x ${quantity}`, 20, y); pdf.text(`KES ${(product.price * quantity).toLocaleString("en-KE")}`, 150, y); y += 10; });
    y += 6; pdf.text(`Estimated total: KES ${(order?.total || 0).toLocaleString("en-KE")}`, 20, y); y += 10; pdf.text("Delivery estimate: same day, subject to pharmacist review and delivery availability.", 20, y, { maxWidth: 165 });
    pdf.save(`naomi-pharmacy-${ref}.pdf`);
  };
  const share = () => { const message = `Hello Naomi Pharmacy, I have placed order ${ref}. Please let me know if you need anything else.`; window.open(`https://wa.me/254112272061?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer"); };
  return <main className="page-main"><div className="container confirmation-wrap"><div className="confirmation-card"><SuccessTick animated /><span className="eyebrow">Order received</span><h1>Thanks, {order?.name?.split(" ")[0] || "you're all set"}.</h1><p className="confirmation-lede">Your order is in. Our pharmacy team will check any prescription items and confirm your delivery shortly.</p><div className="reference-box"><span>Order reference</span><b>{ref}</b><small>Keep this reference handy when contacting us.</small></div><div className="delivery-estimate"><span><Truck size={20} /></span><div><b>Estimated delivery, same day</b><small>We will text you with an update as your order is prepared.</small></div><PackageCheck size={20} /></div>{order?.items && <div className="confirmed-items">{order.items.map((item) => <div key={item.product.name}><span>{item.product.name}, {item.packSize} × {item.quantity}</span><b>KES {(item.product.price * item.quantity).toLocaleString("en-KE")}</b></div>)}<div className="confirm-total"><span>Total</span><b>KES {(order.total || 0).toLocaleString("en-KE")}</b></div></div>}<div className="confirmation-actions"><button className="button button-outline" onClick={download}><Download size={16} /> Download receipt</button><button className="button button-soft" onClick={share}><MessageCircle size={16} /> Share on WhatsApp</button></div><div className="confirmation-next"><span>What happens next?</span><p>We will verify your order and share M-Pesa payment instructions before arranging your Nairobi delivery.</p></div><div className="confirmation-links"><Link href="/my-orders">View my orders</Link><Link href="/shop">Continue shopping</Link></div></div></div></main>;
}

export default function OrderConfirmationPage() {
  return <Suspense fallback={<main className="page-main"><div className="container loading-inline">Preparing your receipt...</div></main>}><ConfirmationContent /></Suspense>;
}
