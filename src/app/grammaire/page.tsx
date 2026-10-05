import type { Metadata } from "next";
import GrammaireQuiz from "@/components/GrammaireQuiz";

export const metadata: Metadata = { title: "Grammaire · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🧩 Grammaire</h1>
      <GrammaireQuiz />
    </div>
  );
}
