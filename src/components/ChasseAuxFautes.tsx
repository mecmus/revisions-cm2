"use client";
import { useState } from "react";
import { CHASSES, corrige, splitPunct, texteFautif, type Chasse } from "@/lib/orthographe";
import { saveAttempt } from "@/lib/progress";
import CoursLink from "./CoursLink";

export default function ChasseAuxFautes() {
  const [c, setC] = useState<Chasse | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [cur, setCur] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  if (!c) return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {CHASSES.map((x) => (
        <li key={x.id}><button onClick={() => { setC(x); setFound([]); setMisses(0); setCur(null); setMsg(null); setShown(false); }}
          className="block h-full w-full rounded-2xl bg-white p-4 text-left shadow hover:shadow-lg">
          <b>{x.titre}</b><p className="text-sm text-slate-500">{x.fautes.length} fautes cachées</p></button></li>
      ))}
    </ul>
  );

  const words = texteFautif(c);
  const byIndex = new Map(c.fautes.map((f) => [f.index, f]));
  const done = found.length === c.fautes.length;
  const tap = (i: number) => {
    if (done || shown || found.includes(i)) return;
    if (byIndex.has(i)) { setCur(i); setValue(splitPunct(words[i])[0]); setMsg(null); }
    else { setMisses(misses + 1); setCur(null); setMsg(`« ${splitPunct(words[i])[0]} » est bien écrit.`); }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = byIndex.get(cur!)!;
    if (corrige(f, value)) {
      const n = [...found, cur!];
      setFound(n); setCur(null); setMsg(`✅ ${f.regle}`);
      if (n.length === c.fautes.length) saveAttempt({ subject: "orthographe", itemId: `chasse:${c.id}`, score: Math.max(0, c.fautes.length - misses), max: c.fautes.length });
    } else setMsg("❌ Ce n'est pas encore ça. Relis la règle et réessaie.");
  };
  const f = cur !== null ? byIndex.get(cur) : null;

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <button onClick={() => setC(null)} className="text-emerald-700">← Autres textes</button>
      <h2 className="text-xl font-bold">{c.titre}</h2>
      <p className="font-semibold">🔎 Fautes trouvées : {found.length} / {c.fautes.length}{misses ? ` · ${misses} mot(s) touché(s) à tort` : ""}</p>
      <p className="text-xl leading-loose">
        {words.map((w, i) => {
          const fixed = found.includes(i), reveal = shown && byIndex.has(i) && !fixed;
          return <span key={i}>
            <button onClick={() => tap(i)} className={`rounded px-0.5 ${fixed ? "bg-emerald-100 font-bold text-emerald-800" : reveal ? "bg-rose-100 text-rose-700" : cur === i ? "bg-amber-200" : "hover:bg-amber-100"}`}>
              {fixed ? c.texte.split(" ")[i] : reveal ? <><s>{w}</s> {c.texte.split(" ")[i]}</> : w}
            </button>{" "}
          </span>;
        })}
      </p>
      {f && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-2xl bg-amber-50 p-4">
          <label htmlFor="corr" className="font-semibold">Corrige le mot :</label>
          <input id="corr" autoFocus value={value} onChange={(e) => setValue(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false}
            className="rounded-xl border-2 border-amber-300 px-3 py-2 text-lg" />
          <button className="btn bg-emerald-600 text-white">✔️ Valider</button>
          <CoursLink id={f.cours} label="💡 Indice : le cours" />
        </form>
      )}
      {msg && <p className="rounded-2xl bg-slate-50 p-3">{msg}</p>}
      {done && <p className="rounded-2xl bg-emerald-600 p-4 font-bold text-white">🎉 Bravo, toutes les fautes sont corrigées !</p>}
      {!done && !shown && <button onClick={() => setShown(true)} className="btn bg-slate-100">🙈 Voir la correction</button>}
      <p className="text-xs text-slate-400">Texte original : {c.source}. Fautes ajoutées volontairement pour l&apos;exercice.</p>
    </section>
  );
}
