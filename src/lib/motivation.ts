/** Étoiles, série de jours, objectif de la semaine et badges — tout est calculé depuis l'historique local. */
export type Att = { subject: string; itemId: string; score: number; max: number; date: string };

export const OBJECTIF_DEFAUT = 5;
/** 3 étoiles ≥ 90 %, 2 étoiles ≥ 70 %, 1 étoile ≥ 50 %. */
export const etoiles = (score: number, max: number) => {
  if (max <= 0) return 0;
  const p = score / max;
  return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.5 ? 1 : 0;
};
export const totalEtoiles = (as: Att[]) => as.reduce((s, a) => s + etoiles(a.score, a.max), 0);

/** Jour calendaire local (YYYY-MM-DD). */
export const jour = (d: Date | string) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const hier = (j: string) => { const [y, m, d] = j.split("-").map(Number); return jour(new Date(y, m - 1, d - 1)); };

/** Jours consécutifs avec au moins une série. Si rien aujourd'hui, la série tient encore jusqu'à la fin de la journée. */
export function serie(as: Att[], now = new Date()): number {
  const jours = new Set(as.map((a) => jour(a.date)));
  let j = jour(now);
  if (!jours.has(j)) j = hier(j);
  let n = 0;
  while (jours.has(j)) { n++; j = hier(j); }
  return n;
}

/** Début de semaine = lundi, à minuit, heure locale. */
export const lundi = (now: Date) => { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
export const seriesSemaine = (as: Att[], now = new Date()) => as.filter((a) => new Date(a.date) >= lundi(now) && new Date(a.date) <= now).length;

export type Badge = { id: string; emoji: string; titre: string; condition: string; obtenu: boolean };
export function badges(as: Att[], now = new Date()): Badge[] {
  const matieres = new Set(as.map((a) => a.subject));
  const parfaits = as.filter((a) => a.max > 0 && a.score === a.max).length;
  const best = serie(as, now);
  const B = (id: string, emoji: string, titre: string, condition: string, obtenu: boolean): Badge => ({ id, emoji, titre, condition, obtenu });
  return [
    B("premier", "🌱", "Premier pas", "Terminer une série", as.length >= 1),
    B("dix", "📚", "Studieux", "Terminer 10 séries", as.length >= 10),
    B("cinquante", "🏅", "Persévérant", "Terminer 50 séries", as.length >= 50),
    B("parfait", "💯", "Sans faute", "Faire un 100 % sur une série", parfaits >= 1),
    B("parfait5", "🌟", "Perfectionniste", "Faire 5 séries à 100 %", parfaits >= 5),
    B("serie3", "🔥", "En feu", "3 jours de suite", best >= 3),
    B("serie7", "🚀", "Une semaine !", "7 jours de suite", best >= 7),
    B("matieres4", "🧭", "Explorateur", "Essayer 4 matières différentes", matieres.size >= 4),
    B("etoiles50", "⭐", "50 étoiles", "Gagner 50 étoiles", totalEtoiles(as) >= 50),
  ];
}
