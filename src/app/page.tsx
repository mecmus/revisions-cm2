import Link from "next/link";
import { subjects } from "@/lib/subjects";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Bonjour ! 👋</h1>
      <p className="mt-2 text-lg text-slate-600">Que veux-tu réviser aujourd&apos;hui ?</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => {
          const card = (
            <div className={`h-full rounded-3xl bg-gradient-to-br ${s.color} p-6 text-white shadow-lg transition ${s.available ? "hover:-translate-y-1 hover:shadow-xl" : "opacity-50"}`}>
              <div className="text-4xl">{s.emoji}</div>
              <h2 className="mt-3 text-2xl font-bold">{s.title}</h2>
              <p className="mt-1 text-white/90">{s.description}</p>
              {!s.available && <span className="mt-3 inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">Bientôt</span>}
            </div>
          );
          return s.available ? <Link key={s.slug} href={`/${s.slug}`}>{card}</Link> : <div key={s.slug}>{card}</div>;
        })}
      </div>
    </div>
  );
}
