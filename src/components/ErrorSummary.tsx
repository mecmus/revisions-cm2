"use client";
import { useState } from "react";
import type { Token } from "@/lib/correction";
import { COURS_ERREUR } from "@/lib/cours";
import CoursLink from "./CoursLink";
import { ERROR_LABEL, summarize, type ErrorType } from "@/lib/errorType";

/** Bilan par type d'erreur + conseil, avec tolérances ponctuation / majuscules. */
export default function ErrorSummary({ tokens }: { tokens: Token[] }) {
  const [ignorePunctuation, setP] = useState(false);
  const [ignoreCase, setC] = useState(false);
  const { counts, errors } = summarize(tokens, { ignorePunctuation, ignoreCase });
  const entries = (Object.entries(counts) as [ErrorType, number][]).sort((a, b) => b[1] - a[1]);
  return (
    <section className="rounded-3xl bg-white p-5 shadow">
      <h2 className="font-bold">📊 Bilan : {errors === 0 ? "aucune erreur 🎉" : `${errors} erreur(s)`}</h2>
      <ul className="mt-2 space-y-2">
        {entries.map(([k, n]) => (
          <li key={k} className="rounded-2xl bg-amber-50 p-3">
            <b>{ERROR_LABEL[k].label} × {n}</b>
            <p className="text-sm text-slate-600">💡 {ERROR_LABEL[k].tip}</p>
            <div className="mt-2"><CoursLink id={COURS_ERREUR[k]} /></div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
        <label className="flex items-center gap-2"><input type="checkbox" checked={ignorePunctuation} onChange={(e) => setP(e.target.checked)} />Ignorer la ponctuation</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={ignoreCase} onChange={(e) => setC(e.target.checked)} />Ignorer les majuscules</label>
      </div>
    </section>
  );
}
