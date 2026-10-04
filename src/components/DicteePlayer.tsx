"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dictee } from "@/content/dictees";
import { correct } from "@/lib/correction";
import { saveAttempt } from "@/lib/progress";

const PONCT: Record<string, string> = { ",": " virgule", ".": " point", ";": " point-virgule", ":": " deux-points", "!": " point d'exclamation", "?": " point d'interrogation" };

function phrases(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
}

export default function DicteePlayer({ dictee }: { dictee: Dictee }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const supported = useSyncExternalStore(() => () => {}, () => "speechSynthesis" in window, () => true);
  const [rate, setRate] = useState(0.75);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReturnType<typeof correct> | null>(null);
  const list = phrases(dictee.text);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pick = () => setVoice(speechSynthesis.getVoices().find((v) => v.lang.startsWith("fr")) ?? null);
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
    return () => speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  const speak = (text: string, withPunct = true) => {
    speechSynthesis.cancel();
    const spoken = withPunct ? text.replace(/[,.;:!?]/g, (p) => PONCT[p] + " ") : text;
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = "fr-FR"; u.rate = rate; if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  };

  const submit = () => {
    const r = correct(dictee.text, answer);
    setResult(r);
    saveAttempt({ subject: "dictees", itemId: dictee.id, score: Math.max(0, r.total - r.errors), max: r.total });
  };

  if (!supported) return <p className="mt-6 rounded-xl bg-amber-50 p-4">Ton navigateur ne sait pas lire à voix haute. Essaie Chrome, Edge ou Safari.</p>;

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow">
        <h2 className="font-bold">1. Écoute</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => speak(dictee.text, false)} className="btn bg-slate-100">🔊 Lecture complète</button>
          <button onClick={() => speak(list[idx])} className="btn bg-indigo-600 text-white">▶️ Phrase {idx + 1}/{list.length}</button>
          <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="btn bg-slate-100 disabled:opacity-40">⏮️</button>
          <button disabled={idx === list.length - 1} onClick={() => { setIdx(idx + 1); speak(list[idx + 1]); }} className="btn bg-slate-100 disabled:opacity-40">⏭️ Suivante</button>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm">Vitesse
          <input type="range" min={0.5} max={1.1} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} />
        </label>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow">
        <h2 className="font-bold">2. Écris</h2>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!result} rows={6} spellCheck={false} autoCorrect="off" autoCapitalize="off"
          className="mt-3 w-full rounded-2xl border-2 border-slate-200 p-4 text-lg focus:border-indigo-500 focus:outline-none" placeholder="Écris la dictée ici…" />
        {!result ? (
          <button onClick={submit} disabled={!answer.trim()} className="btn mt-3 bg-emerald-600 text-white disabled:opacity-40">✅ Corriger</button>
        ) : (
          <button onClick={() => { setResult(null); setAnswer(""); setIdx(0); }} className="btn mt-3 bg-slate-100">🔁 Recommencer</button>
        )}
      </section>

      {result && (
        <section className="rounded-3xl bg-white p-5 shadow">
          <h2 className="font-bold">3. Correction : {result.errors === 0 ? "🎉 Aucune faute !" : `${result.errors} erreur${result.errors > 1 ? "s" : ""}`}</h2>
          <p className="mt-3 text-lg leading-loose">
            {result.tokens.map((t, i) => t.ok ? <span key={i}>{t.expected} </span> : (
              <span key={i} className="mr-1 inline-flex flex-col rounded-lg bg-rose-50 px-1 align-top leading-tight">
                <span className="font-bold text-emerald-700">{t.expected || "∅"}</span>
                <span className="text-sm text-rose-600 line-through">{t.given ?? "(oublié)"}</span>
              </span>
            ))}
          </p>
        </section>
      )}
    </div>
  );
}
