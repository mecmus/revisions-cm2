"use client";
import { useRef, useState } from "react";
import { check, KINDS, makeQuestions, SOURCE, THEMES, type Kind, type Question, type Theme } from "@/lib/anglais";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

type Answer = { q: Question; given: string; ok: boolean };
const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

export default function AnglaisQuiz() {
  const [themes, setThemes] = useState<Theme[]>(["be", "have", "can"]);
  const [kinds, setKinds] = useState<Kind[]>(["affirmatif", "negatif", "question", "reponse"]);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Answer | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const focus = () => setTimeout(() => input.current?.focus(), 0);
  const start = () => { setQs(makeQuestions(10, themes, kinds)); setAnswers([]); setFeedback(null); setValue(""); focus(); };

  if (!qs) {
    return (
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
        <div>
          <h2 className="font-bold">Verbe</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setThemes(toggle(themes, t.id))}
                className={`btn ${themes.includes(t.id) ? "bg-fuchsia-600 text-white" : "bg-slate-100"}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold">Type d&apos;exercice</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button key={k.id} onClick={() => setKinds(toggle(kinds, k.id))}
                className={`btn ${kinds.includes(k.id) ? "bg-fuchsia-600 text-white" : "bg-slate-100"}`}>{k.label}</button>
            ))}
          </div>
        </div>
        <button onClick={start} disabled={!themes.length || !kinds.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 10 questions</button>
        <p className="text-xs text-slate-500">Tu peux écrire les formes courtes (isn&apos;t, I&apos;m, can&apos;t) ou les formes pleines (is not, I am).</p>
        <p className="text-xs text-slate-400">Source : {SOURCE}</p>
      </section>
    );
  }

  const i = answers.length;
  if (i >= qs.length) {
    const score = answers.filter((a) => a.ok).length;
    return (
      <section className="space-y-4">
        <div className="rounded-3xl bg-fuchsia-600 p-6 text-white shadow">
          <h2 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Perfect!" : `Score : ${score} / ${qs.length}`}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={start} className="btn bg-white text-fuchsia-700">🔁 Nouvelle série</button>
            <button onClick={() => setQs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
          </div>
        </div>
        <ul className="space-y-2 rounded-3xl bg-white p-5 shadow">
          {answers.map((a, k) => (
            <li key={k}>{a.ok ? "✅" : "❌"} <b className="text-emerald-700">{a.q.reponse}</b>
              {!a.ok && <span className="text-rose-600 line-through"> {a.given || "(vide)"}</span>}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {[...new Set(answers.filter((a) => !a.ok).map((a) => a.q.cours))].map((id) => (
            <CoursLink key={id} id={id} label={`📘 Cours : ${THEMES.find((t) => id.endsWith(t.id))?.label}`} />
          ))}
        </div>
      </section>
    );
  }

  const q = qs[i];
  const [avant, apres] = q.phrase.split("…").map((s) => s.trim());
  const submit = () => {
    if (feedback) {
      const next = [...answers, feedback];
      setAnswers(next); setFeedback(null); setValue("");
      if (next.length >= qs.length) {
        for (const t of [...new Set(next.map((a) => a.q.theme))]) {
          const des = next.filter((a) => a.q.theme === t);
          saveAttempt({ subject: "anglais", itemId: t, score: des.filter((a) => a.ok).length, max: des.length });
        }
      }
      focus();
      return;
    }
    if (value.trim()) setFeedback({ q, given: value, ok: check(q, value) });
  };

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-fuchsia-500 transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <p className="text-sm text-slate-500">Question {i + 1} / {qs.length}</p>
      <p className="text-lg text-slate-700">{q.consigne}</p>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-wrap items-center gap-2 text-2xl" lang="en">
        {avant && <span>{avant}</span>}
        <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} readOnly={!!feedback} autoFocus
          autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} aria-label="Ta réponse"
          className={`w-44 min-w-0 rounded-2xl border-2 p-3 focus:outline-none ${feedback ? (feedback.ok ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50") : "border-slate-200 focus:border-fuchsia-500"}`} />
        {apres && <span>{apres}</span>}
        <button className="btn bg-fuchsia-600 text-white">{feedback ? "Suivant ➡️" : "✅ Vérifier"}</button>
      </form>
      {feedback && (feedback.ok
        ? <p className="text-lg font-bold text-emerald-700">🎉 Well done !</p>
        : <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-lg">La bonne réponse : <b lang="en">{q.reponse}</b></p>
            <p className="mt-1 text-sm text-slate-600">💡 {q.regle}</p>
            <div className="mt-3"><CoursLink id={q.cours} label="📘 Revoir le cours" /></div>
          </div>)}
    </section>
  );
}
