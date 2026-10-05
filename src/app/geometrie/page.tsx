import type { Metadata } from "next";
import GeometrieQuiz from "@/components/GeometrieQuiz";

export const metadata: Metadata = { title: "Géométrie & mesures · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">📐 Géométrie &amp; mesures</h1>
      <GeometrieQuiz />
    </div>
  );
}
