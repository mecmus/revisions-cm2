import type { Metadata } from "next";
import ProblemesQuiz from "@/components/ProblemesQuiz";

export const metadata: Metadata = { title: "Problèmes · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🧮 Problèmes</h1>
      <p className="text-slate-600">Lis bien l&apos;énoncé, cherche les étapes, puis donne la réponse. Un indice coûte un demi-point.</p>
      <ProblemesQuiz />
    </div>
  );
}
