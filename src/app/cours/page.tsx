import Link from "next/link";
import { COURS } from "@/lib/cours";

export const metadata = { title: "Cours · Révisions CM2" };

export default function Page() {
  const matieres = [...new Set(COURS.map((c) => c.matiere))];
  const groupes = [
    { titre: "🇫🇷 Français", matieres: matieres.filter((m) => m !== "Mathématiques") },
    { titre: "🔢 Mathématiques", matieres: matieres.filter((m) => m === "Mathématiques") },
  ];
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sky-600">← Accueil</Link>
      <h1 className="text-3xl font-extrabold">📘 Cours</h1>
      {groupes.map((g) => (
        <div key={g.titre} className="space-y-4">
          <h2 className="text-2xl font-extrabold">{g.titre}</h2>
          {g.matieres.map((m) => (
        <section key={m}>
          <h3 className="text-xl font-bold">{m}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {COURS.filter((c) => c.matiere === m).map((c) => (
              <li key={c.id}><Link href={`/cours/${c.id}`} className="block rounded-2xl bg-white p-4 shadow hover:shadow-lg">
                <b>{c.titre}</b><p className="text-sm text-slate-500">{c.regle}</p></Link></li>
            ))}
          </ul>
        </section>
          ))}
        </div>
      ))}
    </div>
  );
}
