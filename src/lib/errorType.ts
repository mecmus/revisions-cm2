import type { Token } from "./correction";

export type ErrorType = "oubli" | "ajout" | "ponctuation" | "majuscule" | "accent" | "accord" | "homophone" | "orthographe";

export const ERROR_LABEL: Record<ErrorType, { label: string; tip: string }> = {
  oubli: { label: "Mot oublié", tip: "Relis ta phrase en suivant le texte mot à mot." },
  ajout: { label: "Mot en trop", tip: "Vérifie que tu n'as pas écrit un mot deux fois." },
  ponctuation: { label: "Ponctuation", tip: "Écoute bien « virgule », « point »… et place-les au bon endroit." },
  majuscule: { label: "Majuscule", tip: "Majuscule en début de phrase et aux noms propres, pas après une virgule." },
  accent: { label: "Accent", tip: "Vérifie les accents : é, è, ê, à, ù, ç…" },
  accord: { label: "Accord", tip: "Cherche le mot qui commande l'accord (nom, sujet) : -s, -e, -nt…" },
  homophone: { label: "Homophone", tip: "Remplace par un autre mot pour vérifier : a/avait, et/et puis, est/était, son/mon, on/il…" },
  orthographe: { label: "Orthographe", tip: "Apprends l'écriture de ce mot, en l'épelant." },
};

const HOMOPHONES: string[][] = [
  ["a", "à"], ["et", "est", "es", "ai"], ["son", "sont"], ["on", "ont", "on n'"], ["ces", "ses", "c'est", "s'est"],
  ["ou", "où"], ["la", "là", "l'a"], ["ce", "se"], ["leur", "leurs"], ["ma", "m'a"], ["ta", "t'a"], ["mes", "mais", "met", "mets"],
  ["peu", "peut", "peux"], ["sans", "s'en", "cent", "sang"], ["quand", "quant", "qu'en"], ["dans", "d'en"], ["sa", "ça", "çà"],
];
const PUNCT = /^[.,;:!?«»"]$/;
const stripAccents = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
// Terminaisons d'accord (pluriel, féminin, conjugaison, participe/infinitif)
const ENDINGS = /(s|x|e|es|ent|nt|ez|er|é|ée|és|ées|ait|ais|aient|t|d)$/;
const stem = (s: string) => s.replace(ENDINGS, "");

export function classify(t: Token): ErrorType | null {
  if (t.ok) return null;
  if (t.given === null) return PUNCT.test(t.expected) ? "ponctuation" : "oubli";
  if (t.expected === "") return PUNCT.test(t.given) ? "ponctuation" : "ajout";
  const e = t.expected, g = t.given;
  if (PUNCT.test(e) || PUNCT.test(g)) return "ponctuation";
  if (e.toLowerCase() === g.toLowerCase()) return "majuscule";
  const el = e.toLowerCase(), gl = g.toLowerCase();
  if (HOMOPHONES.some((h) => h.includes(el) && h.includes(gl))) return "homophone";
  if (stripAccents(el) === stripAccents(gl)) return "accent";
  if (stem(stripAccents(el)) === stem(stripAccents(gl)) && stem(stripAccents(el)).length >= 2) return "accord";
  return "orthographe";
}

export type Options = { ignorePunctuation: boolean; ignoreCase: boolean };

/** Bilan par type d'erreur, en tenant compte des tolérances choisies. */
export function summarize(tokens: Token[], opts: Options = { ignorePunctuation: false, ignoreCase: false }) {
  const counts: Partial<Record<ErrorType, number>> = {};
  let errors = 0;
  for (const t of tokens) {
    const k = classify(t);
    if (!k || (opts.ignorePunctuation && k === "ponctuation") || (opts.ignoreCase && k === "majuscule")) continue;
    counts[k] = (counts[k] ?? 0) + 1;
    errors++;
  }
  return { counts, errors };
}
