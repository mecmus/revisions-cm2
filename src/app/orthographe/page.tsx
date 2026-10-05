import type { Metadata } from "next";
import ChasseAuxFautes from "@/components/ChasseAuxFautes";
import HomophonesQuiz from "@/components/HomophonesQuiz";

export const metadata: Metadata = { title: "Orthographe · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">🔎 Orthographe</h1>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">🕵️ Chasse aux fautes</h2>
        <p className="text-slate-600">Touche les mots mal écrits, puis corrige-les.</p>
        <ChasseAuxFautes />
      </section>
      <section className="space-y-3 rounded-3xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">🔁 Homophones</h2>
        <p className="text-slate-600">a/à, et/est, son/sont, on/ont, ces/ses, ou/où, ce/se, leur/leurs, la/là…</p>
        <HomophonesQuiz />
      </section>
    </div>
  );
}
