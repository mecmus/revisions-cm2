import data from "../content/grammaire.json";

export type Nature = "N" | "V" | "A" | "D" | "P" | "ADV" | "PREP" | "C";
export type Role = "S" | "V" | "COD" | "COI" | "CCL" | "CCT" | "CCM" | "ATT";
export type Phrase = { id: string; mots: [string, Nature | null][]; fonctions: { role: Role; debut: number; fin: number }[] };
export const PHRASES = data as Phrase[];

export const NATURE: Record<Nature, string> = {
  N: "nom", V: "verbe", A: "adjectif", D: "déterminant", P: "pronom", ADV: "adverbe", PREP: "préposition", C: "conjonction de coordination",
};
export const ROLE: Record<Role, string> = {
  S: "le sujet", V: "le verbe conjugué", COD: "le complément d'objet direct (COD)", COI: "le complément d'objet indirect (COI)",
  CCL: "le complément circonstanciel de lieu", CCT: "le complément circonstanciel de temps", CCM: "le complément circonstanciel de manière",
  ATT: "l'attribut du sujet",
};

export type Question = { phrase: Phrase; kind: "nature" | "fonction"; cible: string; consigne: string; reponse: number[]; cours: string };

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const shuffle = <T,>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);

/** Toutes les questions possibles pour une phrase. */
export function questionsFor(p: Phrase, kind: "nature" | "fonction"): Question[] {
  if (kind === "fonction") return p.fonctions.map((f) => ({
    phrase: p, kind, cible: f.role, reponse: range(f.debut, f.fin), cours: "grammaire/fonctions",
    consigne: `Touche tous les mots qui forment ${ROLE[f.role]}.`,
  }));
  const natures = [...new Set(p.mots.map((m) => m[1]).filter((n): n is Nature => !!n))];
  return natures.map((n) => ({
    phrase: p, kind, cible: n, cours: "grammaire/natures",
    reponse: p.mots.flatMap((m, i) => (m[1] === n ? [i] : [])),
    consigne: `Touche ${p.mots.filter((m) => m[1] === n).length > 1 ? "tous les mots" : "le mot"} de nature : ${NATURE[n]}.`,
  }));
}

export function makeQuestions(n: number, kinds: ("nature" | "fonction")[]): Question[] {
  return shuffle(PHRASES).slice(0, n).map((p) => pick(questionsFor(p, pick(kinds))));
}

export const isRight = (q: Question, sel: number[]) =>
  sel.length === q.reponse.length && q.reponse.every((i) => sel.includes(i));
