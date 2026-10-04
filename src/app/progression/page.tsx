"use client";

import dynamic from "next/dynamic";

const ProgressList = dynamic(() => import("@/components/ProgressList"), { ssr: false });

export default function Progression() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold">⭐ Ma progression</h1>
      <p className="text-sm text-slate-500">Enregistrée uniquement sur cet appareil.</p>
      <ProgressList />
    </div>
  );
}
