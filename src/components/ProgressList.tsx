"use client";

import { useState } from "react";
import { loadAttempts, resetProgress, type Attempt } from "@/lib/progress";

export default function ProgressList() {
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts().reverse());
  return (
    <>
      {attempts.length === 0 ? <p className="mt-6">Pas encore d&apos;exercice. À toi de jouer !</p> : (
        <ul className="mt-6 space-y-2">
          {attempts.map((a, i) => (
            <li key={i} className="flex justify-between rounded-xl bg-white p-3 shadow-sm">
              <span>{a.subject} · {a.itemId}</span>
              <span className="font-bold">{a.score}/{a.max} · {new Date(a.date).toLocaleDateString("fr-FR")}</span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => { if (confirm("Effacer toute la progression ?")) { resetProgress(); setAttempts([]); } }} className="btn mt-6 bg-rose-50 text-rose-700">Effacer</button>
    </>
  );
}
