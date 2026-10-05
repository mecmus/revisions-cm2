"use client";
import { useRef, useState } from "react";
import { check, makeQuestions, THEMES, type Q, type Theme } from "@/lib/calcul";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

export default function CalculQuiz() {
  const [themes, setThemes] = useState<Theme[]>(["mental"]);
  const [qs, setQs] = useState<Q[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<boolean | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const focus = () => setTimeout(() => input.current?.focus(), 0);
  const start = () => { setQs(makeQuestions(10, themes)); setI(0); setScore(0); setValue(""); setFb(null); focus(); };

  if (!qs) return (
    <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => <button key={t.id} onClick={() => setThemes(themes.includes(t.id) ? themes.filter((x) => x !== t.id) : [...themes, t.id])}
          className={`btn ${themes.includes(t.id) ? "bg-sky-600 text-white" : "bg-slate-100"}`}>{t.label}</button>)}
      </div>
      <button onClick={start} disabled={!themes.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 10 calculs</button>
    </section>
  );
  if (i >= qs.length) return (
    <section className="rounded-3xl bg-sky-600 p-6 text-white shadow">
      <h2 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Parfait !" : `Score : ${score} / ${qs.length}`}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={start} className="btn bg-white text-sky-700">🔁 Nouvelle série</button>
        <button onClick={() => setQs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
      </div>
    </section>
  );
  const q = qs[i];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fb !== null) { // suivant
      if (i + 1 >= qs.length) saveAttempt({ subject: "maths", itemId: themes.join("+"), score, max: qs.length });
      setI(i + 1); setValue(""); setFb(null); focus(); return;
    }
    const ok = check(q, value); setFb(ok); if (ok) setScore(score + 1);
  };
  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <p className="text-sm text-slate-500">Calcul {i + 1} / {qs.length} · Score {score}</p>
      <form onSubmit={submit} className="space-y-4">
        <label htmlFor="rep" className="block text-2xl font-bold">{q.enonce}</label>
        <div className="flex gap-2">
          <input id="rep" ref={input} value={value} onChange={(e) => setValue(e.target.value)} readOnly={fb !== null}
            inputMode={q.reponse === "<" || q.reponse === ">" ? "text" : "decimal"} autoComplete="off"
            className="w-48 rounded-xl border-2 border-sky-300 px-3 py-2 text-2xl" />
          <button disabled={!value.trim()} className="btn bg-emerald-600 text-white disabled:opacity-40">{fb === null ? "✔️ Vérifier" : "Suivant →"}</button>
        </div>
      </form>
      {fb !== null && (
        <div className={`rounded-2xl p-4 ${fb ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className="font-bold">{fb ? "✅ Bravo !" : `❌ La bonne réponse est ${q.reponse}.`}</p>
          {!fb && <><p className="mt-1 text-sm text-slate-600">💡 {q.aide}</p><div className="mt-2"><CoursLink id={q.cours} /></div></>}
        </div>
      )}
    </section>
  );
}
