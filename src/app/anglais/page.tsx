import Link from "next/link";
import type { Metadata } from "next";
import AnglaisQuiz from "@/components/AnglaisQuiz";

export const metadata: Metadata = { title: "Anglais · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sky-600">← Accueil</Link>
      <h1 className="text-3xl font-extrabold">🇬🇧 Anglais : to be, have, can</h1>
      <AnglaisQuiz />
    </div>
  );
}
