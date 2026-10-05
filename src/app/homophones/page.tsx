import type { Metadata } from "next";
import HomophonesQuiz from "@/components/HomophonesQuiz";

export const metadata: Metadata = { title: "Homophones · Révisions CM2" };

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🔁 Homophones</h1>
      <p className="text-slate-600">a/à, et/est, son/sont, on/ont, ces/ses, ou/où, ce/se, leur/leurs, la/là…</p>
      <div className="rounded-3xl bg-white p-6 shadow"><HomophonesQuiz /></div>
    </div>
  );
}
