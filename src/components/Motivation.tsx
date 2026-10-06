"use client";
import { useState } from "react";
import { loadAttempts } from "@/lib/progress";
import { badges, OBJECTIF_DEFAUT, serie, seriesSemaine, totalEtoiles } from "@/lib/motivation";

const KEY = "revisions-cm2:objectif";
const lireObjectif = () => { try { return Math.min(14, Math.max(1, Number(localStorage.getItem(KEY)) || OBJECTIF_DEFAUT)); } catch { return OBJECTIF_DEFAUT; } };

export default function Motivation() {
  const [as] = useState(() => loadAttempts());
  const [objectif, setObjectif] = useState(lireObjectif);
  const now = new Date();
  const fait = seriesSemaine(as, now), jours = serie(as, now), bs = badges(as, now);
  const atteint = fait >= objectif;
  const change = (n: number) => { const v = Math.min(14, Math.max(1, n)); setObjectif(v); localStorage.setItem(KEY, String(v)); };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-amber-100 p-4 text-center"><p className="text-4xl font-extrabold">⭐ {totalEtoiles(as)}</p><p className="text-sm text-slate-600">étoiles</p></div>
        <div className="rounded-3xl bg-orange-100 p-4 text-center"><p className="text-4xl font-extrabold">🔥 {jours}</p><p className="text-sm text-slate-600">{jours > 1 ? "jours de suite" : "jour de suite"}</p></div>
      </div>
      <section className="space-y-2 rounded-3xl bg-white p-5 shadow" aria-label="Objectif de la semaine">
        <h2 className="text-lg font-extrabold">🎯 Objectif de la semaine</h2>
        <progress className="h-3 w-full" value={Math.min(fait, objectif)} max={objectif} aria-label="Avancement de l'objectif" />
        <p>{atteint ? `🎉 Objectif atteint : ${fait} séries cette semaine !` : `${fait} / ${objectif} séries. Encore ${objectif - fait} !`}</p>
        <p className="flex items-center gap-2 text-sm text-slate-600">Mon objectif :
          <button onClick={() => change(objectif - 1)} aria-label="Moins" className="btn bg-slate-100">−</button><b>{objectif}</b>
          <button onClick={() => change(objectif + 1)} aria-label="Plus" className="btn bg-slate-100">+</button> séries par semaine</p>
      </section>
      <section aria-label="Badges">
        <h2 className="mb-2 text-lg font-extrabold">🏆 Mes badges ({bs.filter((b) => b.obtenu).length} / {bs.length})</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {bs.map((b) => (
            <li key={b.id} className={`rounded-2xl p-3 ${b.obtenu ? "bg-emerald-50" : "bg-slate-100 opacity-60"}`}>
              <p className="text-2xl">{b.obtenu ? b.emoji : "🔒"} <b className="text-base">{b.titre}</b></p>
              <p className="text-sm text-slate-600">{b.condition}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
