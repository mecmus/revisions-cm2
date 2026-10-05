"use client";
import { useState } from "react";
import { isRight, makeQuestions, type Question } from "@/lib/grammaire";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

type Kind = "nature" | "fonction";
const KINDS: { id: Kind; label: string }[] = [{ id: "nature", label: "Nature des mots" }, { id: "fonction", label: "Fonctions dans la phrase" }];

export default function GrammaireQuiz() {
  const [kinds, setKinds] = useState<Kind[]>(["nature"]);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const start = () => { setQs(makeQuestions(10, kinds)); setI(0); setSel([]); setChecked(false); setScore(0); };

  if (!qs) return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
      <h2 className="font-bold">Je m&apos;entraîne sur…</h2>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.id} onClick={() => setKinds(kinds.includes(k.id) ? kinds.filter((x) => x !== k.id) : [...kinds, k.id])}
            className={`btn ${kinds.includes(k.id) ? "bg-amber-500 text-white" : "bg-slate-100"}`}>{k.label}</button>
        ))}
      </div>
      <button onClick={start} disabled={!kinds.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 10 questions</button>
    </section>
  );

  if (i >= qs.length) return (
    <section className="rounded-3xl bg-amber-500 p-6 text-white shadow">
      <h2 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Parfait !" : `Score : ${score} / ${qs.length}`}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={start} className="btn bg-white text-amber-700">🔁 Nouvelle série</button>
        <button onClick={() => setQs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
      </div>
    </section>
  );

  const q = qs[i];
  const ok = isRight(q, sel);
  const validate = () => { setChecked(true); if (ok) setScore(score + 1); };
  const next = () => {
    const n = i + 1;
    if (n >= qs.length) saveAttempt({ subject: "grammaire", itemId: kinds.join("+"), score, max: qs.length });
    setI(n); setSel([]); setChecked(false);
  };
  const cls = (k: number) => {
    const s = sel.includes(k), r = q.reponse.includes(k);
    if (!checked) return s ? "bg-amber-500 text-white" : "bg-slate-100 hover:bg-amber-100";
    if (r && s) return "bg-emerald-500 text-white";
    if (r) return "bg-emerald-100 ring-2 ring-emerald-500";
    if (s) return "bg-rose-500 text-white line-through";
    return "bg-slate-100 opacity-60";
  };

  return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
      <p className="text-sm text-slate-500">Question {i + 1} / {qs.length} · Score {score}</p>
      <p className="text-lg font-bold">{q.consigne}</p>
      <div className="flex flex-wrap gap-2 text-xl">
        {q.phrase.mots.map(([w, n], k) => n ? (
          <button key={k} disabled={checked} aria-pressed={sel.includes(k)}
            onClick={() => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k])}
            className={`rounded-xl px-3 py-2 font-semibold transition ${cls(k)}`}>{w}</button>
        ) : <span key={k} className="self-end px-1 py-2">{w}</span>)}
      </div>
      {!checked ? (
        <button onClick={validate} disabled={!sel.length} className="btn bg-emerald-600 text-white disabled:opacity-40">✔️ Vérifier</button>
      ) : (
        <div className={`rounded-2xl p-4 ${ok ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className="font-bold">{ok ? "✅ Bravo !" : "❌ Pas tout à fait : les bonnes réponses sont en vert."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!ok && <CoursLink id={q.cours} />}
            <button onClick={next} className="btn bg-amber-500 text-white">Suivant →</button>
          </div>
        </div>
      )}
    </section>
  );
}
