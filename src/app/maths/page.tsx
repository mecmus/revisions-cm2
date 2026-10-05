import type { Metadata } from "next";
import CalculQuiz from "@/components/CalculQuiz";

export const metadata: Metadata = { title: "Calcul & nombres · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">➗ Calcul &amp; nombres</h1>
      <CalculQuiz />
    </div>
  );
}
