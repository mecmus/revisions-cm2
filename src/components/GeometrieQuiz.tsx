"use client";
import { useRef, useState } from "react";
import { checkGQ, makeGQ, THEMES, type GQ, type Theme } from "@/lib/geometrie";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";
import Figure from "./Figure";

export default function GeometrieQuiz() {
  const [themes, setThemes] = useState<Theme[]>(["figures", "angles", "symetrie"]);
  const [qs, setQs] = useState<GQ[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<boolean | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const start = () => { setQs(makeGQ(10, themes)); setI(0); setScore(0); setValue(""); setFb(null); };

  if (!qs) return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => <button key={t.id} onClick={() => setThemes(themes.includes(t.id) ? themes.filter((x) => x !== t.id) : [...themes, t.id])}
          className={`btn ${themes.includes(t.id) ? "bg-green-600 text-white" : "bg-slate-100"}`}>{t.label}</button>)}
      </div>
      <button onClick={start} disabled={!themes.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 10 questions</button>
    </section>
  );
  if (i >= qs.length) return (
    <section className="rounded-3xl bg-green-600 p-6 text-white shadow">
      <h2 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Parfait !" : `Score : ${score} / ${qs.length}`}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={start} className="btn bg-white text-green-700">🔁 Nouvelle série</button>
        <button onClick={() => setQs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
      </div>
    </section>
  );
  const q = qs[i];
  const answer = (s: string) => { if (fb !== null) return; setValue(s); const ok = checkGQ(q, s); setFb(ok); if (ok) setScore(score + 1); };
  const next = () => {
    if (i + 1 >= qs.length) saveAttempt({ subject: "geometrie", itemId: themes.join("+"), score, max: qs.length });
    setI(i + 1); setValue(""); setFb(null); setTimeout(() => input.current?.focus(), 0);
  };
  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <p className="text-sm text-slate-500">Question {i + 1} / {qs.length} · Score {score}</p>
      <p className="text-xl font-bold">{q.consigne}</p>
      {q.shape && <div className="flex justify-center"><Figure s={q.shape} /></div>}
      {q.choix ? (
        <div className="flex flex-wrap gap-2">
          {q.choix.map((c) => <button key={c} onClick={() => answer(c)}
            className={`btn text-lg ${fb !== null && c === q.reponse ? "bg-emerald-500 text-white" : fb === false && c === value ? "bg-rose-500 text-white" : "bg-slate-100"}`}>{c}</button>)}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (fb === null) answer(value); else next(); }} className="flex flex-wrap items-center gap-2">
          <input ref={input} aria-label="Réponse" value={value} onChange={(e) => setValue(e.target.value)} readOnly={fb !== null} inputMode="decimal" autoComplete="off" autoFocus
            className="w-40 rounded-xl border-2 border-green-300 px-3 py-2 text-2xl" />
          {q.unite && <span className="text-xl">{q.unite}</span>}
          {fb === null && <button disabled={!value.trim()} className="btn bg-emerald-600 text-white disabled:opacity-40">✔️ Vérifier</button>}
        </form>
      )}
      {fb !== null && (
        <div className={`rounded-2xl p-4 ${fb ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className="font-bold">{fb ? "✅ Bravo !" : `❌ La bonne réponse est : ${q.reponse}${q.unite ? ` ${q.unite}` : ""}.`}</p>
          <p className="mt-1 text-sm text-slate-600">💡 {q.aide}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!fb && <CoursLink id={q.cours} />}
            <button onClick={next} className="btn bg-green-600 text-white">Suivant →</button>
          </div>
        </div>
      )}
    </section>
  );
}
