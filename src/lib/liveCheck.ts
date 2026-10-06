import { correct, tokenize } from "./correction";

export type LiveWord = { text: string; ok: boolean };

/** Texte « terminé » : on ignore le mot en cours de frappe (pas encore suivi d'un espace ou d'une ponctuation). */
export function completed(typed: string): string {
  return /[\s.,;:!?»]$/u.test(typed) ? typed : typed.replace(/[\p{L}\p{N}'’-]+$/u, "");
}

/**
 * Mots déjà terminés, marqués justes ou faux. Ne révèle jamais le mot attendu.
 * L'alignement tolère un oubli ou un mot en trop : une erreur n'entraîne pas tout le reste en faux.
 */
export function liveCheck(expected: string, typed: string): LiveWord[] {
  const done = completed(typed);
  const b = tokenize(done);
  if (b.length === 0) return [];
  const a = tokenize(expected);
  let best: ReturnType<typeof correct> | null = null;
  for (let k = Math.max(1, b.length - 2); k <= Math.min(a.length, b.length + 2); k++) {
    const r = correct(a.slice(0, k).join(" "), done);
    if (!best || r.errors < best.errors) best = r;
  }
  return (best ?? correct(expected, done)).tokens.filter((t) => t.given !== null).map((t) => ({ text: t.given as string, ok: t.ok }));
}
