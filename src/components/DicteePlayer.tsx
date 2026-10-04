"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictee, DicteeAudio } from "@/content/dictees";
import { correct, countWords } from "@/lib/correction";
import { saveAttempt } from "@/lib/progress";
import { useDicteeAudio } from "@/lib/useDicteeAudio";
import WordDiff from "./WordDiff";

type Mode = "etapes" | "complete";
type Done = { first: ReturnType<typeof correct>; last: ReturnType<typeof correct> };

export default function DicteePlayer({ dictee, audio }: { dictee: Dictee; audio: DicteeAudio }) {
  const [mode, setMode] = useState<Mode>("etapes");
  const [rate, setRate] = useState(1);
  const [smart, setSmart] = useState(true);
  const [idleSec, setIdleSec] = useState(8);
  const play = useDicteeAudio(rate);

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow">
        <div className="flex flex-wrap gap-2">
          {(["etapes", "complete"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`btn ${mode === m ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>
              {m === "etapes" ? "🪜 Phrase par phrase" : "📝 Dictée complète"}
            </button>
          ))}
          <button onClick={() => play(audio.full, dictee.text, false)} className="btn bg-slate-100">🔊 Écouter le texte</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">Vitesse
            <input type="range" min={0.7} max={1.2} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} />
            Lecteur intelligent</label>
          {smart && <label className="flex items-center gap-2">Répéter après
            <select value={idleSec} onChange={(e) => setIdleSec(+e.target.value)} className="rounded border px-1">
              {[5, 8, 12, 20].map((s) => <option key={s} value={s}>{s} s</option>)}
            </select> sans écrire</label>}
        </div>
        <p className="mt-2 text-xs text-slate-400">Voix : Piper « {audio.voice} » (SIWIS, CC-BY 4.0)</p>
      </section>
      {mode === "etapes"
        ? <StepMode key="e" dictee={dictee} audio={audio} play={play} smart={smart} idleSec={idleSec} />
        : <FullMode key="c" dictee={dictee} audio={audio} play={play} />}
    </div>
  );
}

type Play = ReturnType<typeof useDicteeAudio>;

/** Suit l'écriture : lit le segment suivant quand l'élève l'a rattrapé, relit si l'élève bloque. */
function useSmartReader(segments: { text: string; audio: string }[], typed: string, play: Play, enabled: boolean, idleSec: number) {
  const ends = useMemo(() => segments.reduce<number[]>((acc, s) => [...acc, (acc.at(-1) ?? 0) + countWords(s.text)], []), [segments]);
  const [seg, setSeg] = useState(0);
  const repeats = useRef(0);
  const n = countWords(typed);

  /** Appelé à chaque frappe : passe au morceau suivant quand l'élève a fini d'écrire le morceau courant. */
  const onType = (value: string) => {
    if (!enabled || seg >= segments.length - 1) return;
    if (countWords(value) >= ends[seg] && /[\s,.;:!?]$/.test(value)) {
      const next = seg + 1;
      setSeg(next); repeats.current = 0;
      play(segments[next].audio, segments[next].text);
    }
  };

  useEffect(() => {
    if (!enabled || n >= ends.at(-1)!) return;
    const t = setTimeout(() => {
      if (repeats.current >= 2) return;
      repeats.current++;
      play(segments[seg].audio, segments[seg].text);
    }, idleSec * 1000);
    return () => clearTimeout(t);
  }, [typed, seg, enabled, idleSec, n, ends, segments, play]);

  return {
    seg,
    onType,
    start: () => { setSeg(0); repeats.current = 0; play(segments[0].audio, segments[0].text); },
    repeat: () => play(segments[seg].audio, segments[seg].text),
    goto: (i: number) => { setSeg(i); repeats.current = 0; play(segments[i].audio, segments[i].text); },
  };
}

function StepMode({ dictee, audio, play, smart, idleSec }: { dictee: Dictee; audio: DicteeAudio; play: Play; smart: boolean; idleSec: number }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Done[]>([]);
  const finished = idx >= audio.sentences.length;
  const errors = done.reduce((a, d) => a + d.first.errors, 0);
  const total = done.reduce((a, d) => a + d.first.total, 0);

  useEffect(() => {
    if (finished) saveAttempt({ subject: "dictees", itemId: dictee.id, score: Math.max(0, total - errors), max: total });
  }, [finished, dictee.id, total, errors]);

  return (
    <>
      {done.map((d, i) => (
        <section key={i} className="rounded-3xl bg-white p-5 shadow">
          <h3 className="text-sm font-bold text-slate-500">Phrase {i + 1} — {d.first.errors === 0 ? "✅ parfait" : `${d.first.errors} erreur(s)${d.last.errors === 0 ? ", corrigée(s) ✅" : ""}`}</h3>
          <WordDiff tokens={d.first.tokens} />
        </section>
      ))}
      {finished ? (
        <section className="rounded-3xl bg-indigo-600 p-6 text-white shadow">
          <h2 className="text-2xl font-extrabold">{errors === 0 ? "🎉 Aucune faute !" : `Bravo, c'est fini ! ${errors} erreur(s) au premier essai.`}</h2>
          <button onClick={() => { setIdx(0); setDone([]); }} className="btn mt-4 bg-white text-indigo-700">🔁 Recommencer</button>
        </section>
      ) : (
        <Sentence key={idx} n={idx} total={audio.sentences.length} sentence={audio.sentences[idx]} play={play} smart={smart} idleSec={idleSec}
          onDone={(d) => { setDone([...done, d]); setIdx(idx + 1); }} />
      )}
    </>
  );
}

function Sentence({ n, total, sentence, play, smart, idleSec, onDone }: {
  n: number; total: number; sentence: DicteeAudio["sentences"][number]; play: Play; smart: boolean; idleSec: number; onDone: (d: Done) => void;
}) {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(n > 0); // enchaînement automatique après la 1re phrase
  const [first, setFirst] = useState<ReturnType<typeof correct> | null>(null);
  const reader = useSmartReader(sentence.segments, typed, play, smart && started && !first, idleSec);

  useEffect(() => {
    if (n > 0 && smart) play(sentence.segments[0].audio, sentence.segments[0].text);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uniquement à l'apparition de la phrase
  }, []);

  const check = () => {
    const r = correct(sentence.text, typed);
    if (!first) { if (r.errors === 0) onDone({ first: r, last: r }); else setFirst(r); }
    else onDone({ first, last: r });
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow">
      <h2 className="font-bold">Phrase {n + 1}/{total}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {!started
          ? <button onClick={() => { setStarted(true); reader.start(); }} className="btn bg-indigo-600 text-white">▶️ Commencer la phrase</button>
          : <button onClick={reader.repeat} className="btn bg-indigo-600 text-white">🔁 Répète ({reader.seg + 1}/{sentence.segments.length})</button>}
        {started && sentence.segments.map((s, i) => (
          <button key={i} onClick={() => reader.goto(i)} title={`Morceau ${i + 1}`}
            className={`h-10 w-10 rounded-full font-bold ${i === reader.seg ? "bg-indigo-100 text-indigo-700" : "bg-slate-100"}`}>{i + 1}</button>
        ))}
      </div>
      <textarea value={typed} onChange={(e) => { setTyped(e.target.value); reader.onType(e.target.value); }} rows={3} spellCheck={false} autoCorrect="off" autoCapitalize="off" autoComplete="off"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (typed.trim()) check(); } }}
        className="mt-3 w-full rounded-2xl border-2 border-slate-200 p-4 text-lg focus:border-indigo-500 focus:outline-none" placeholder="Écris la phrase ici…" />
      {first && (
        <div className="mt-2 rounded-2xl bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">{first.errors} erreur(s) : corrige ta phrase puis vérifie à nouveau.</p>
          <WordDiff tokens={first.tokens.map((t) => t.ok ? t : { ...t, expected: "?" })} />
        </div>
      )}
      <button onClick={check} disabled={!typed.trim()} className="btn mt-3 bg-emerald-600 text-white disabled:opacity-40">
        {first ? "✅ Vérifier ma correction" : "✅ Vérifier la phrase"}
      </button>
    </section>
  );
}

function FullMode({ dictee, audio, play }: { dictee: Dictee; audio: DicteeAudio; play: Play }) {
  const segments = useMemo(() => audio.sentences.flatMap((s) => s.segments), [audio]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReturnType<typeof correct> | null>(null);
  const submit = () => {
    const r = correct(dictee.text, answer);
    setResult(r);
    saveAttempt({ subject: "dictees", itemId: dictee.id, score: Math.max(0, r.total - r.errors), max: r.total });
  };
  return (
    <>
      <section className="rounded-3xl bg-white p-5 shadow">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => play(segments[i].audio, segments[i].text)} className="btn bg-indigo-600 text-white">▶️ Morceau {i + 1}/{segments.length}</button>
          <button disabled={i === 0} onClick={() => setI(i - 1)} className="btn bg-slate-100 disabled:opacity-40">⏮️</button>
          <button disabled={i === segments.length - 1} onClick={() => { setI(i + 1); play(segments[i + 1].audio, segments[i + 1].text); }} className="btn bg-slate-100 disabled:opacity-40">⏭️ Suivant</button>
        </div>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!result} rows={6} spellCheck={false} autoCorrect="off" autoCapitalize="off"
          className="mt-3 w-full rounded-2xl border-2 border-slate-200 p-4 text-lg focus:border-indigo-500 focus:outline-none" placeholder="Écris la dictée ici…" />
        {!result
          ? <button onClick={submit} disabled={!answer.trim()} className="btn mt-3 bg-emerald-600 text-white disabled:opacity-40">✅ Corriger</button>
          : <button onClick={() => { setResult(null); setAnswer(""); setI(0); }} className="btn mt-3 bg-slate-100">🔁 Recommencer</button>}
      </section>
      {result && (
        <section className="rounded-3xl bg-white p-5 shadow">
          <h2 className="font-bold">Correction : {result.errors === 0 ? "🎉 Aucune faute !" : `${result.errors} erreur(s)`}</h2>
          <WordDiff tokens={result.tokens} />
        </section>
      )}
    </>
  );
}
