import Link from "next/link";
import { bilan, categories, cours, type Subject } from "@/lib/subjects";

function Card({ s, big = false }: { s: Subject; big?: boolean }) {
  const card = (
    <div className={`h-full rounded-3xl bg-gradient-to-br ${s.color} p-6 text-white shadow-lg transition ${s.available ? "hover:-translate-y-1 hover:shadow-xl" : "opacity-50"}`}>
      <div className={big ? "text-5xl" : "text-4xl"}>{s.emoji}</div>
      <h3 className={`mt-3 font-bold ${big ? "text-3xl" : "text-2xl"}`}>{s.title}</h3>
      <p className="mt-1 text-white/90">{s.description}</p>
      {!s.available && <span className="mt-3 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">Bientôt</span>}
    </div>
  );
  return s.available ? <Link href={`/${s.slug}`}>{card}</Link> : card;
}

export default function Home() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Bonjour ! 👋</h1>
        <p className="mt-2 text-lg text-slate-600">Que veux-tu réviser aujourd&apos;hui ?</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2"><Card s={cours} big /><Card s={bilan} big /></div>
      {categories.map((c) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="text-2xl font-extrabold">{c.emoji} {c.title}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.subjects.map((s) => <Card key={s.slug} s={s} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
