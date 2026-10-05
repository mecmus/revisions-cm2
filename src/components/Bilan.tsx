"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Figure from "./Figure";
import CoursLink from "./CoursLink";
import { loadAttempts } from "@/lib/progress";
import {
  checkTQ, etats, evolution, loadPassations, makeTest, notion, NOTIONS, pointsFromAttempts, pointsFromPassations, recommandations,
  resetPassations, savePassation, SEUIL_ACQUIS, SEUIL_EN_COURS, MIN_REPONSES, PAR_NOTION, type Passation, type Statut, type TQ,
} from "@/lib/bilan";

const BADGE: Record<Statut, string> = { acquis: "✅ Acquis", "en-cours": "🟡 En cours", "a-travailler": "🔴 À travailler", inconnu: "⚪ Pas encore évalué" };
const COULEUR: Record<Statut, string> = { acquis: "bg-emerald-50", "en-cours": "bg-amber-50", "a-travailler": "bg-rose-50", inconnu: "bg-slate-50" };
const pc = (x: number | null) => (x === null ? "–" : `${Math.round(x * 100)} %`);

function Test({ onDone }: { onDone: () => void }) {
  const [qs] = useState<TQ[]>(() => makeTest());
  const [i, setI] = useState(0);
  const [res, setRes] = useState<Record<string, { ok: number; n: number }>>({});
  const [value, setValue] = useState("");
  const [fb, setFb] = useState<boolean | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const q = qs[i];
  useEffect(() => { input.current?.focus(); }, [i]);

  const answer = (s: string) => {
    if (fb !== null) return;
    setValue(s);
    const ok = checkTQ(q, s);
    setFb(ok);
    setRes((r) => ({ ...r, [q.notion]: { ok: (r[q.notion]?.ok ?? 0) + (ok ? 1 : 0), n: (r[q.notion]?.n ?? 0) + 1 } }));
  };
  const next = () => {
    if (i + 1 >= qs.length) { savePassation({ date: new Date().toISOString(), notions: res }); onDone(); return; }
    setI(i + 1); setValue(""); setFb(null);
  };
  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Question {i + 1} / {qs.length}</span>
        <button onClick={() => { if (confirm("Abandonner le test ? Rien ne sera enregistré.")) onDone(); }} className="underline">Abandonner</button>
      </div>
      <progress className="h-2 w-full" value={i} max={qs.length} aria-label="Avancement" />
      {q.contexte && <p className="text-xl">{q.contexte}</p>}
      <p className="text-xl font-bold">{q.consigne}</p>
      {q.shape && <div className="flex justify-center"><Figure s={q.shape} /></div>}
      {q.choix ? (
        <div className="flex flex-wrap gap-2">
          {q.choix.map((c) => <button key={c} onClick={() => answer(c)}
            className={`btn text-lg ${fb !== null && c === q.reponse ? "bg-emerald-500 text-white" : fb === false && c === value ? "bg-rose-500 text-white" : "bg-slate-100"}`}>{c}</button>)}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (fb === null) { if (value.trim()) answer(value); } else next(); }} className="flex flex-wrap items-center gap-2">
          <input ref={input} aria-label="Réponse" value={value} onChange={(e) => setValue(e.target.value)} readOnly={fb !== null} autoComplete="off"
            className="w-56 rounded-xl border-2 border-sky-300 px-3 py-2 text-2xl" />
          {q.unite && <span className="text-xl">{q.unite}</span>}
          {fb === null && <button disabled={!value.trim()} className="btn bg-emerald-600 text-white disabled:opacity-40">✔️ Valider</button>}
        </form>
      )}
      {fb !== null && (
        <div className={`rounded-2xl p-4 ${fb ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className="font-bold">{fb ? "✅ Bravo !" : `❌ La bonne réponse : ${q.reponse}`}</p>
          <button onClick={next} className="btn mt-3 bg-sky-600 text-white">{i + 1 >= qs.length ? "Voir mon bilan" : "Suivant →"}</button>
        </div>
      )}
    </section>
  );
}

function Resultats({ passations, onTest }: { passations: Passation[]; onTest: () => void }) {
  const now = new Date();
  const points = [...pointsFromPassations(passations), ...pointsFromAttempts(loadAttempts())];
  const es = etats(points, now);
  const reco = recommandations(es);
  const evo = evolution(passations);
  const evalues = es.filter((e) => e.statut !== "inconnu");
  const dernier = passations.at(-1);
  const sections: [Statut, string][] = [["acquis", "💪 Mes forces"], ["en-cours", "🟡 Presque là"], ["a-travailler", "🎯 À travailler"], ["inconnu", "⚪ Pas encore évalué"]];

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-3xl bg-white p-6 shadow">
        <h2 className="text-xl font-extrabold">{passations.length ? "Refaire le test" : "Passer le test de niveau"}</h2>
        <p className="text-slate-600">{NOTIONS.length * PAR_NOTION} questions, environ 15 à 20 minutes, {NOTIONS.length} notions. {dernier && `Dernier test : ${new Date(dernier.date).toLocaleDateString("fr-FR")}.`}</p>
        <button onClick={onTest} className="btn bg-emerald-600 text-white">▶️ {passations.length ? "Refaire le test" : "Commencer le test"}</button>
      </section>

      {evalues.length === 0 ? <p className="text-slate-600">Pas encore de résultat : passe le test pour découvrir tes forces et tes points à travailler.</p> : (
        <>
          {reco.length > 0 && (
            <section aria-labelledby="reco" className="space-y-3">
              <h2 id="reco" className="text-2xl font-extrabold">🚀 Mes {reco.length} priorités</h2>
              <ol className="space-y-3">
                {reco.map((e) => { const n = notion(e.notion)!; return (
                  <li key={e.notion} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 ${COULEUR[e.statut]}`}>
                    <div><p className="text-lg font-bold">{n.label}</p><p className="text-sm text-slate-600">{BADGE[e.statut]} · {pc(e.pct)}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <CoursLink id={e.notion} label="📘 La fiche" />
                      <Link href={n.page} className="btn bg-sky-600 text-white">▶️ {n.exercice}</Link>
                    </div>
                  </li>); })}
              </ol>
            </section>
          )}
          {sections.map(([s, titre]) => { const l = es.filter((e) => e.statut === s); return l.length === 0 ? null : (
            <section key={s} className="space-y-2">
              <h2 className="text-xl font-extrabold">{titre}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {l.map((e) => <li key={e.notion} className={`flex justify-between rounded-xl p-3 ${COULEUR[s]}`}><span>{notion(e.notion)!.label}</span><b>{pc(e.pct)}</b></li>)}
              </ul>
            </section>); })}
          {evo.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xl font-extrabold">📈 Évolution depuis le test précédent</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {evo.map((e) => { const d = Math.round((e.apres - e.avant) * 100); return (
                  <li key={e.notion} className="flex justify-between rounded-xl bg-white p-3 shadow-sm"><span>{notion(e.notion)!.label}</span>
                    <b className={d > 0 ? "text-emerald-700" : d < 0 ? "text-rose-700" : "text-slate-500"}>{pc(e.avant)} → {pc(e.apres)} {d > 0 ? "↗️" : d < 0 ? "↘️" : "="}</b></li>); })}
              </ul>
            </section>
          )}
          <p className="text-sm text-slate-500">
            Comment c&apos;est calculé : ✅ acquis à partir de {Math.round(SEUIL_ACQUIS * 100)} % de réussite, 🟡 en cours à partir de {Math.round(SEUIL_EN_COURS * 100)} %, 🔴 en dessous ; au moins {MIN_REPONSES} réponses.
            Les résultats récents comptent plus que les anciens (le poids est divisé par 2 tous les 30 jours). Données gardées uniquement sur cet appareil.
          </p>
        </>
      )}
      {passations.length > 0 && <button onClick={() => { if (confirm("Effacer les résultats des tests de niveau ?")) { resetPassations(); location.reload(); } }} className="btn bg-rose-50 text-rose-700">Effacer mes bilans</button>}
    </div>
  );
}

export default function Bilan() {
  const [mode, setMode] = useState<"view" | "test">("view");
  const [passations, setPassations] = useState<Passation[]>(() => loadPassations());
  if (mode === "test") return <Test onDone={() => { setPassations(loadPassations()); setMode("view"); window.scrollTo(0, 0); }} />;
  return <Resultats passations={passations} onTest={() => setMode("test")} />;
}
