import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
export default function NotFoundPage() { return <main className="page-main error-page"><div className="container error-card"><span className="error-pill"><Plus size={34} /></span><span className="eyebrow">A little detour</span><h1>This medicine page does not exist.</h1><p>It may have moved, or the address might need another look.</p><Link href="/shop" className="button button-primary"><ArrowLeft size={16} /> Back to Shop</Link></div></main>; }
