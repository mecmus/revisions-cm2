"use client";
import { useState } from "react";
import { COURS_HOMOPHONES, HOMOPHONES, shuffle, type Homophone } from "@/lib/orthographe";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

export default function HomophonesQuiz() {
  const [qs, setQs] = useState<Homophone[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const start = () => { setQs(shuffle(HOMOPHONES).slice(0, 10)); setI(0); setScore(0); setPicked(null); };

  if (!qs) return <button onClick={start} className="btn bg-emerald-600 text-white">▶️ 10 phrases</button>;
  if (i >= qs.length) return (
    <div className="rounded-3xl bg-emerald-600 p-6 text-white">
      <h3 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Parfait !" : `Score : ${score} / ${qs.length}`}</h3>
      <button onClick={start} className="btn mt-3 bg-white text-emerald-700">🔁 Nouvelle série</button>
    </div>
  );
  const q = qs[i];
  const [a, b] = q.phrase.split("{}");
  const choose = (x: string) => { if (picked) return; setPicked(x); if (x === q.bonne) setScore(score + 1); };
  const next = () => {
    if (i + 1 >= qs.length) saveAttempt({ subject: "orthographe", itemId: "homophones", score, max: qs.length });
    setI(i + 1); setPicked(null);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Phrase {i + 1} / {qs.length} · Score {score}</p>
      <p className="text-2xl">{a}<span className={`mx-1 rounded px-2 font-bold ${picked ? (picked === q.bonne ? "bg-emerald-100" : "bg-rose-100") : "bg-slate-100"}`}>{picked ? q.bonne : "…"}</span>{b}</p>
      <div className="flex gap-3">
        {q.choix.map((x) => <button key={x} onClick={() => choose(x)} className={`btn text-xl ${picked === x ? (x === q.bonne ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-slate-100"}`}>{x}</button>)}
      </div>
      {picked && <div className="flex flex-wrap gap-2">
        {picked !== q.bonne && <CoursLink id={COURS_HOMOPHONES} />}
        <button onClick={next} className="btn bg-emerald-600 text-white">Suivant →</button>
      </div>}
    </div>
  );
}
