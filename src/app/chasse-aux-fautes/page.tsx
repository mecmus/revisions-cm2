import type { Metadata } from "next";
import ChasseAuxFautes from "@/components/ChasseAuxFautes";

export const metadata: Metadata = { title: "Chasse aux fautes · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🕵️ Chasse aux fautes</h1>
      <p className="text-slate-600">Touche les mots mal écrits, puis corrige-les.</p>
      <ChasseAuxFautes />
    </div>
  );
}
