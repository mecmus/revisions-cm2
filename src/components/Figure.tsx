import type { Shape } from "@/lib/geometrie";

/** Dessin SVG d'une figure de géométrie. */
export default function Figure({ s }: { s: Shape }) {
  const box = "max-h-56 w-full max-w-xs";
  if (s.kind === "poly") return (
    <svg viewBox="0 0 160 140" className={box} role="img" aria-label="figure"><polygon points={s.pts.map((p) => p.join(",")).join(" ")} className="fill-sky-100 stroke-sky-700" strokeWidth="3" strokeLinejoin="round" /></svg>
  );
  if (s.kind === "circle") return <svg viewBox="0 0 160 140" className={box}><circle cx="80" cy="70" r={s.r} className="fill-sky-100 stroke-sky-700" strokeWidth="3" /></svg>;
  if (s.kind === "angle") {
    const o = [40, 120], L = 100, a = (s.deg * Math.PI) / 180;
    const p = [o[0] + L * Math.cos(a), o[1] - L * Math.sin(a)];
    const arc = s.deg === 90
      ? <path d={`M ${o[0] + 18} ${o[1]} L ${o[0] + 18} ${o[1] - 18} L ${o[0]} ${o[1] - 18}`} className="fill-none stroke-rose-500" strokeWidth="2" />
      : <path d={`M ${o[0] + 25} ${o[1]} A 25 25 0 0 0 ${o[0] + 25 * Math.cos(a)} ${o[1] - 25 * Math.sin(a)}`} className="fill-none stroke-rose-500" strokeWidth="2" />;
    return (
      <svg viewBox="-60 0 220 140" className={box} role="img" aria-label="angle">
        <line x1={o[0]} y1={o[1]} x2={o[0] + L} y2={o[1]} className="stroke-sky-700" strokeWidth="3" strokeLinecap="round" />
        <line x1={o[0]} y1={o[1]} x2={p[0]} y2={p[1]} className="stroke-sky-700" strokeWidth="3" strokeLinecap="round" />{arc}
      </svg>
    );
  }
  if (s.kind === "grid") {
    const c = 16;
    return (
      <svg viewBox={`-2 -2 ${s.w * c + 4} ${s.h * c + 4}`} className={box} role="img" aria-label="quadrillage">
        {Array.from({ length: s.w * s.h }, (_, k) => <rect key={k} x={(k % s.w) * c} y={Math.floor(k / s.w) * c} width={c} height={c} className="fill-white stroke-slate-300" />)}
        {s.cells.map(([x, y]) => <rect key={`${x},${y}`} x={x * c} y={y * c} width={c} height={c} className="fill-sky-500 stroke-slate-300" />)}
        {s.axis === "v" ? <line x1={s.at * c} y1={-2} x2={s.at * c} y2={s.h * c + 2} className="stroke-rose-600" strokeWidth="3" />
          : <line x1={-2} y1={s.at * c} x2={s.w * c + 2} y2={s.at * c} className="stroke-rose-600" strokeWidth="3" />}
      </svg>
    );
  }
  const k = 120 / Math.max(s.w, s.h), W = s.w * k, H = s.h * k;
  return (
    <svg viewBox={`-30 -20 ${W + 60} ${H + 45}`} className={box} role="img" aria-label="rectangle">
      <rect width={W} height={H} className="fill-lime-100 stroke-green-700" strokeWidth="3" />
      <text x={W / 2} y={-6} textAnchor="middle" className="fill-slate-700 text-[12px] font-bold">{s.w} {s.unit}</text>
      <text x={W + 6} y={H / 2} className="fill-slate-700 text-[12px] font-bold">{s.h} {s.unit}</text>
    </svg>
  );
}
