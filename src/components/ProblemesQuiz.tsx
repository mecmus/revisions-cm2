"use client";
import { useRef, useState } from "react";
import { checkProbleme, makeProblemes, TYPES, type Probleme, type Type } from "@/lib/problemes";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

export default function ProblemesQuiz() {
  const [types, setTypes] = useState<Type[]>(TYPES.map((t) => t.id));
  const [ps, setPs] = useState<Probleme[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<boolean | null>(null);
  const [aide, setAide] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const focus = () => setTimeout(() => input.current?.focus(), 0);
  const start = () => { setPs(makeProblemes(5, types)); setI(0); setScore(0); setValue(""); setFb(null); setAide(0); focus(); };

  if (!ps) return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => <button key={t.id} onClick={() => setTypes(types.includes(t.id) ? types.filter((x) => x !== t.id) : [...types, t.id])}
          className={`btn ${types.includes(t.id) ? "bg-violet-600 text-white" : "bg-slate-100"}`}>{t.label}</button>)}
      </div>
      <button onClick={start} disabled={!types.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 5 problèmes</button>
    </section>
  );
  if (i >= ps.length) return (
    <section className="rounded-3xl bg-violet-600 p-6 text-white shadow">
      <h2 className="text-2xl font-extrabold">{score === ps.length ? "🎉 Parfait !" : `Score : ${score} / ${ps.length}`}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={start} className="btn bg-white text-violet-700">🔁 Nouvelle série</button>
        <button onClick={() => setPs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
      </div>
    </section>
  );
  const p = ps[i];
  const shownSteps = fb === false ? p.etapes.length : Math.min(aide, p.etapes.length - 1);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fb !== null) {
      if (i + 1 >= ps.length) saveAttempt({ subject: "problemes", itemId: types.join("+"), score, max: ps.length });
      setI(i + 1); setValue(""); setFb(null); setAide(0); focus(); return;
    }
    const ok = checkProbleme(p, value); setFb(ok); if (ok) setScore(score + (aide ? 0.5 : 1));
  };
  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <p className="text-sm text-slate-500">Problème {i + 1} / {ps.length} · Score {score}</p>
      <p className="text-xl">{p.enonce}</p>
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="rep" className="block text-xl font-bold">{p.question}</label>
        <div className="flex flex-wrap items-center gap-2">
          <input id="rep" ref={input} value={value} onChange={(e) => setValue(e.target.value)} readOnly={fb !== null} autoComplete="off"
            className="w-40 rounded-xl border-2 border-violet-300 px-3 py-2 text-2xl" />
          {p.unite && <span className="text-xl">{p.unite}</span>}
          <button disabled={!value.trim()} className="btn bg-emerald-600 text-white disabled:opacity-40">{fb === null ? "✔️ Vérifier" : "Suivant →"}</button>
        </div>
      </form>
      {fb === null && aide < p.etapes.length - 1 && (
        <button onClick={() => setAide(aide + 1)} className="btn bg-amber-100 text-amber-800">💡 Indice ({aide}/{p.etapes.length - 1})</button>
      )}
      {shownSteps > 0 && (
        <ol className="list-decimal space-y-1 rounded-2xl bg-amber-50 p-4 pl-8">
          {p.etapes.slice(0, shownSteps).map((e, k) => <li key={k}>{e}</li>)}
        </ol>
      )}
      {fb !== null && (
        <div className={`rounded-2xl p-4 ${fb ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className="font-bold">{fb ? `✅ Bravo !${aide ? " (avec indice : ½ point)" : ""}` : `❌ La réponse est ${p.reponse}${p.unite ? ` ${p.unite}` : ""}. Regarde les étapes.`}</p>
          {!fb && <div className="mt-2"><CoursLink id={p.cours} /></div>}
        </div>
      )}
    </section>
  );
}
