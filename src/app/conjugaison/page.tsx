import type { Metadata } from "next";
import ConjugaisonQuiz from "@/components/ConjugaisonQuiz";

export const metadata: Metadata = { title: "Conjugaison · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🔤 Conjugaison</h1>
      <ConjugaisonQuiz />
    </div>
  );
}
