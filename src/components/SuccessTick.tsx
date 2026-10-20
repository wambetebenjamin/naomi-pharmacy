export default function SuccessTick({ animated = false }: { animated?: boolean }) {
  return <span className={`success-check ${animated ? "animated-check" : ""}`} aria-hidden="true"><svg viewBox="0 0 28 28" role="presentation"><path className="tick-path" d="m6 14.5 5 5 11-12" /></svg></span>;
}
