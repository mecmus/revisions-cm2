import type { Cours } from "@/lib/cours";

export default function CoursFiche({ c }: { c: Cours }) {
  return (
    <article className="space-y-4">
      <p className="text-sm font-semibold uppercase text-sky-600">{c.matiere}</p>
      <h1 className="text-3xl font-extrabold">📘 {c.titre}</h1>
      {!c.valide && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">Fiche en relecture.</p>}
      <p className="rounded-2xl bg-sky-50 p-4 text-lg font-semibold">{c.regle}</p>
      <ul className="list-disc space-y-2 pl-6">{c.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      <section><h2 className="font-bold">✏️ Exemples</h2><ul className="mt-1 space-y-1 italic">{c.exemples.map((e, i) => <li key={i}>{e}</li>)}</ul></section>
      <section><h2 className="font-bold">⚠️ Pièges</h2><ul className="mt-1 list-disc space-y-1 pl-6">{c.pieges.map((p, i) => <li key={i}>{p}</li>)}</ul></section>
      <p className="rounded-2xl bg-emerald-50 p-4">💡 <b>Astuce :</b> {c.astuce}</p>
      <p className="text-xs text-slate-400">{c.source}</p>
    </article>
  );
}
