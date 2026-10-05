"use client";
import { useRef, useState } from "react";
import { check, makeQuestions, RULES, SOURCE, TENSES, type Question, type Tense } from "@/lib/conjugaison";
import { saveAttempt } from "@/lib/progress";
import { COURS_TEMPS } from "@/lib/cours";
import CoursLink from "./CoursLink";

const GROUPS = [{ id: 1, label: "1er groupe" }, { id: 2, label: "2e groupe" }, { id: 3, label: "3e groupe et irréguliers" }];
type Answer = { q: Question; given: string; ok: boolean };

export default function ConjugaisonQuiz() {
  const [tenses, setTenses] = useState<Tense[]>(["Présent"]);
  const [groups, setGroups] = useState<number[]>([1, 2, 3]);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Answer | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
  const focus = () => setTimeout(() => input.current?.focus(), 0);

  const start = () => { setQs(makeQuestions(10, tenses, groups)); setAnswers([]); setFeedback(null); setValue(""); focus(); };

  if (!qs) {
    return (
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow">
        <div>
          <h2 className="font-bold">Temps</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {TENSES.map((t) => (
              <button key={t} onClick={() => setTenses(toggle(tenses, t))}
                className={`btn ${tenses.includes(t) ? "bg-pink-600 text-white" : "bg-slate-100"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold">Verbes</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button key={g.id} onClick={() => setGroups(toggle(groups, g.id))}
                className={`btn ${groups.includes(g.id) ? "bg-pink-600 text-white" : "bg-slate-100"}`}>{g.label}</button>
            ))}
          </div>
        </div>
        <button onClick={start} disabled={!tenses.length || !groups.length} className="btn bg-emerald-600 text-white disabled:opacity-40">▶️ 10 questions</button>
        <p className="text-xs text-slate-400">Tableaux : {SOURCE}</p>
      </section>
    );
  }

  const i = answers.length;
  if (i >= qs.length) {
    const score = answers.filter((a) => a.ok).length;
    return (
      <section className="space-y-4">
        <div className="rounded-3xl bg-pink-600 p-6 text-white shadow">
          <h2 className="text-2xl font-extrabold">{score === qs.length ? "🎉 Parfait !" : `Score : ${score} / ${qs.length}`}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={start} className="btn bg-white text-pink-700">🔁 Nouvelle série</button>
            <button onClick={() => setQs(null)} className="btn bg-white/20">⚙️ Changer les réglages</button>
          </div>
        </div>
        <ul className="space-y-2 rounded-3xl bg-white p-5 shadow">
          {answers.map((a, k) => (
            <li key={k}>{a.ok ? "✅" : "❌"} <b>{a.q.verb.infinitive}</b> · {a.q.tense} : {a.q.pronoun}<b className="text-emerald-700">{a.q.answer}</b>
              {!a.ok && <span className="text-rose-600 line-through"> {a.given || "(vide)"}</span>}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {[...new Set(answers.filter((a) => !a.ok).map((a) => a.q.tense))].map((t) => (
            <CoursLink key={t} id={COURS_TEMPS[t]} label={`📘 Cours : ${t.toLowerCase()}`} />
          ))}
        </div>
      </section>
    );
  }

  const q = qs[i];
  const submit = () => {
    if (feedback) {
      const next = [...answers, feedback];
      setAnswers(next); setFeedback(null); setValue("");
      if (next.length >= qs.length) saveAttempt({ subject: "conjugaison", itemId: tenses.join(" + "), score: next.filter((a) => a.ok).length, max: qs.length });
      focus();
      return;
    }
    if (value.trim()) setFeedback({ q, given: value, ok: check(q, value) });
  };

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-pink-500 transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <p className="text-sm text-slate-500">Question {i + 1} / {qs.length} · {q.tense}</p>
      <p className="text-2xl">Conjugue <b>{q.verb.infinitive}</b> au <b>{q.tense.toLowerCase()}</b> :</p>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-wrap items-center gap-2 text-2xl">
        <span>{q.pronoun.trim()}</span>
        <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} readOnly={!!feedback} autoFocus
          autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} aria-label="Ta réponse"
          className={`min-w-0 flex-1 rounded-2xl border-2 p-3 focus:outline-none ${feedback ? (feedback.ok ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50") : "border-slate-200 focus:border-pink-500"}`} />
        <button className="btn bg-pink-600 text-white">{feedback ? "Suivant ➡️" : "✅ Vérifier"}</button>
      </form>
      {feedback && (feedback.ok
        ? <p className="text-lg font-bold text-emerald-700">🎉 Bravo !</p>
        : <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-lg">La bonne réponse : <b>{q.pronoun}{q.answer}</b></p>
            <p className="mt-1 text-sm text-slate-600">💡 {RULES[q.tense]}</p>
            <div className="mt-3"><CoursLink id={COURS_TEMPS[q.tense]} label={`📘 Revoir le cours : ${q.tense.toLowerCase()}`} /></div>
          </div>)}
    </section>
  );
}
