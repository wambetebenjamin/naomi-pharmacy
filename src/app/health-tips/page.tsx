import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { tips } from "@/lib/data";
import { PageTitle } from "@/components/Site";

const slugs = ["medicine-routine", "staying-hydrated", "ask-your-pharmacist"];
export default function HealthTipsPage() {
  return <main className="page-main"><div className="container"><PageTitle eyebrow="Notes from our pharmacists" title="Little things that help you feel well." description="Straightforward, practical health tips from the people who know your medicines." /><div className="health-tip-grid">{tips.map((tip, index) => <article className="health-tip-card" key={tip.title}><div className={`article-art article-art-${index}`}><span><BookOpenCheck size={22} /></span><b>{String(index + 1).padStart(2, "0")}</b></div><div className="article-body"><span className="eyebrow">{tip.category}</span><small>{tip.date}</small><h2>{tip.title}</h2><p>{tip.summary}</p><Link href={`/health-tips/${slugs[index]}`} className="text-link">Read article <ArrowRight size={15} /></Link></div></article>)}</div><div className="health-note"><span>Our advice is general information, not a substitute for a diagnosis or personalised care.</span><a href="https://wa.me/254112272061">Ask a pharmacist</a></div></div></main>;
}
