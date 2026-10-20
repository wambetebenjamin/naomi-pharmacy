"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Download, PackageCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import { useCart } from "@/lib/cart";
import { PageTitle } from "@/components/Site";

type StoredOrder = { ref: string; email: string; name: string; total: number; zone: string; slot: string; createdAt?: string; status?: string; items: { product: { slug: string; name: string; price: number; image: string; category: string; rx: boolean; packSize: string; description: string; dosage: string; storage: string; sideEffects: string; manufacturer: string; options: string[] }; quantity: number; packSize: string }[] };
export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const add = useCart((state) => state.add);
  const downloadReceipt = (order: StoredOrder) => {
    const pdf = new jsPDF();
    pdf.setTextColor(36, 76, 253); pdf.setFontSize(21); pdf.text("Naomi Pharmacy", 20, 24);
    pdf.setTextColor(35, 47, 57); pdf.setFontSize(12); pdf.text("Order receipt", 20, 37); pdf.text(`Reference: ${order.ref}`, 20, 49);
    let y = 67;
    order.items.forEach((item) => { pdf.text(`${item.product.name} x ${item.quantity}`, 20, y); pdf.text(`KES ${(item.product.price * item.quantity).toLocaleString("en-KE")}`, 150, y); y += 10; });
    y += 8; pdf.text(`Total: KES ${order.total.toLocaleString("en-KE")}`, 20, y); pdf.save(`naomi-pharmacy-${order.ref}.pdf`);
  };
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders", { cache: "no-store" }).then((response) => response.ok ? response.json() : { orders: [] }).then((result) => setOrders(result.orders || [])).catch(() => setOrders([]));
  }, [status]);
  if (status === "loading") return <main className="page-main"><div className="container"><div className="loading-inline">Checking your account...</div></div></main>;
  if (!session) return <main className="page-main"><div className="container"><PageTitle eyebrow="Your pharmacy account" title="Your orders, all in one place." description="Sign in to see your order history and delivery updates." /><div className="empty-cart"><span className="empty-icon"><ShieldCheck /></span><h2>Sign in to continue.</h2><p>Your order history is private and only visible to you.</p><Link className="button button-primary" href="/auth/signin">Sign in <ArrowRight size={16} /></Link></div></div></main>;
  return <main className="page-main"><div className="container"><PageTitle eyebrow="Your Naomi account" title="Your orders, all in one place." description={`Signed in as ${session.user?.email || "your account"}. Track an order, reorder, or download a receipt.`} />{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.ref}><div className="order-card-head"><span className="order-ref"><PackageCheck size={18} /> {order.ref}</span><span className="order-status">{order.status || "Received"}</span></div><div className="order-card-meta"><span>Delivery: {order.zone}</span><span>Preferred: {order.slot}</span><b>KES {(order.total || 0).toLocaleString("en-KE")}</b></div><div className="order-card-items">{order.items?.map((item) => <span key={item.product.slug}>{item.product.name} × {item.quantity}</span>)}</div><div className="order-card-actions"><button onClick={() => downloadReceipt(order)}><Download size={14} /> Download receipt</button><Link href={`/order-confirmation?ref=${encodeURIComponent(order.ref)}`}>Track order <ArrowRight size={14} /></Link><button onClick={() => order.items?.forEach((item) => add(item.product, item.packSize))}><RefreshCcw size={14} /> Reorder</button></div></article>)}</div> : <div className="empty-cart"><span className="empty-icon"><PackageCheck /></span><h2>No orders found yet.</h2><p>Orders placed with your account will appear here after you check out.</p><Link className="button button-primary" href="/shop">Browse the shop <ArrowRight size={16} /></Link></div>}</div></main>;
}
