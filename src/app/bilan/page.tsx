"use client";
import dynamic from "next/dynamic";

const Bilan = dynamic(() => import("@/components/Bilan"), { ssr: false });

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">🎯 Mon bilan de niveau</h1>
      <p className="text-slate-600">Un test pour savoir ce qui est acquis et ce qu&apos;il faut retravailler.</p>
      <Bilan />
    </div>
  );
}
