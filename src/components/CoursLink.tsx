"use client";
import { useState } from "react";
import CoursFiche from "./CoursFiche";
import { getCours } from "@/lib/cours";

/** Bouton « Revoir le cours » : ouvre la fiche dans un panneau, l'exercice reste en place. */
export default function CoursLink({ id, label = "📘 Revoir le cours" }: { id: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const c = getCours(id);
  if (!c) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn bg-sky-100 text-sky-800">{label}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={c.titre} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <CoursFiche c={c} />
            <button type="button" onClick={() => setOpen(false)} className="btn mt-4 w-full bg-sky-600 text-white">← Revenir à l&apos;exercice</button>
          </div>
        </div>
      )}
    </>
  );
}
