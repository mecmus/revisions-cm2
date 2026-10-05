"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictee } from "@/content/dictees";
import { loadAttempts } from "@/lib/progress";

const NIVEAU = ["", "⭐ Facile", "⭐⭐ Moyen", "⭐⭐⭐ Difficile"];

/** Liste des dictées triées par niveau, avec filtre d'origine et statut « déjà faite ». */
export default function DicteeList({ dictees }: { dictees: Dictee[] }) {
  const [best, setBest] = useState<Record<string, { score: number; max: number }>>({});
  const [filtre, setFiltre] = useState<"tous" | "domaine-public" | "ia">("tous");
  useEffect(() => {
    const b: Record<string, { score: number; max: number }> = {};
    for (const a of loadAttempts()) if (a.subject === "dictees") {
      const cur = b[a.itemId];
      if (!cur || a.score / a.max > cur.score / cur.max) b[a.itemId] = { score: a.score, max: a.max };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du localStorage au montage
    setBest(b);
  }, []);
  const list = dictees.filter((d) => filtre === "tous" || d.origine === filtre).sort((a, b) => a.niveau - b.niveau);
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {([["tous", "Toutes"], ["domaine-public", "📖 Littérature"], ["ia", "✨ Textes IA"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFiltre(k)} className={`btn ${filtre === k ? "bg-indigo-600 text-white" : "bg-white"}`}>{l}</button>
        ))}
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((d) => (
          <li key={d.id}>
            <Link href={`/dictees/${d.id}`} className="block h-full rounded-2xl bg-white p-5 shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold">{d.title}</h2>
                {best[d.id] && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">✅ {best[d.id].score}/{best[d.id].max}</span>}
              </div>
              <p className="text-sm text-slate-500">{d.source}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{NIVEAU[d.niveau]}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{d.theme}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${d.origine === "ia" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {d.origine === "ia" ? "✨ Texte IA" : "📖 Littérature"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
