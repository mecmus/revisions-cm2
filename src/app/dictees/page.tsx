import Link from "next/link";
import { dictees } from "@/content/dictees";

export default function DicteesPage() {
  return (
    <div>
      <Link href="/" className="text-indigo-600">← Accueil</Link>
      <h1 className="mt-2 text-3xl font-extrabold">✍️ Dictées</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {dictees.map((d) => (
          <li key={d.id}>
            <Link href={`/dictees/${d.id}`} className="block rounded-2xl bg-white p-5 shadow hover:shadow-lg">
              <h2 className="text-xl font-bold">{d.title}</h2>
              <p className="text-sm text-slate-500">{d.source}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{d.theme}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${d.origine === "ia" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {d.origine === "ia" ? "✨ Texte IA" : "📖 Littérature"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
