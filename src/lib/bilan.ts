/** Bilan de niveau : test de positionnement, statut par notion, recommandations. Tout reste en local. */
import { check as checkCalcul, makeQuestions as calculQs, THEMES as CALCUL_THEMES, type Rng, type Theme as CalculTheme } from "./calcul";
import { check as checkConj, makeQuestions as conjQs, TENSES } from "./conjugaison";
import { checkGQ, makeGQ, type Shape, type Theme as GTheme } from "./geometrie";
import { NATURE, PHRASES, ROLE, questionsFor, type Nature, type Role } from "./grammaire";
import { HOMOPHONES } from "./orthographe";
import { checkProbleme, makeProblemes, type Type as PType } from "./problemes";
import { COURS_TEMPS } from "./cours";

export type Statut = "acquis" | "en-cours" | "a-travailler" | "inconnu";
export const SEUIL_ACQUIS = 0.8;
export const SEUIL_EN_COURS = 0.5;
export const MIN_REPONSES = 3;
export const DEMI_VIE_JOURS = 30;
export const PAR_NOTION = 3;

export type Notion = { id: string; label: string; page: string; exercice: string };
const N = (id: string, label: string, page: string, exercice: string): Notion => ({ id, label, page, exercice });
export const NOTIONS: Notion[] = [
  ...TENSES.map((t) => N(COURS_TEMPS[t], `Conjugaison : ${t.toLowerCase()}`, "/conjugaison", "Conjugaison")),
  N("grammaire/natures", "Grammaire : nature des mots", "/grammaire", "Grammaire"),
  N("grammaire/fonctions", "Grammaire : fonctions", "/grammaire", "Grammaire"),
  N("orthographe/homophones", "Homophones", "/homophones", "Homophones"),
  N("calcul/mental", "Calcul mental", "/maths", "Calcul & nombres"),
  N("calcul/operations", "Opérations", "/maths", "Calcul & nombres"),
  N("calcul/decimaux", "Nombres décimaux", "/maths", "Calcul & nombres"),
  N("calcul/fractions", "Fractions", "/maths", "Calcul & nombres"),
  N("calcul/grands-nombres", "Grands nombres", "/maths", "Calcul & nombres"),
  N("calcul/problemes", "Problèmes à étapes", "/problemes", "Problèmes"),
  N("calcul/proportionnalite", "Proportionnalité", "/problemes", "Problèmes"),
  N("calcul/durees", "Durées et horaires", "/problemes", "Problèmes"),
  N("geometrie/figures", "Figures", "/geometrie", "Géométrie & mesures"),
  N("geometrie/angles", "Angles", "/geometrie", "Géométrie & mesures"),
  N("geometrie/symetrie", "Symétrie", "/geometrie", "Géométrie & mesures"),
  N("mesures/conversions", "Conversions", "/geometrie", "Géométrie & mesures"),
  N("mesures/perimetre-aire", "Périmètres et aires", "/geometrie", "Géométrie & mesures"),
];
export const notion = (id: string) => NOTIONS.find((n) => n.id === id);

// ───────── Historique : une série qui ne porte que sur UNE notion compte pour cette notion ─────────
type Att = { subject: string; itemId: string; score: number; max: number; date: string };
const ONE: Record<string, Record<string, string>> = {
  maths: Object.fromEntries(CALCUL_THEMES.map((t) => [t.id, `calcul/${t.id}`])),
  conjugaison: Object.fromEntries(TENSES.map((t) => [t, COURS_TEMPS[t]])),
  grammaire: { nature: "grammaire/natures", fonction: "grammaire/fonctions" },
  orthographe: { homophones: "orthographe/homophones" },
  problemes: { etapes: "calcul/problemes", monnaie: "calcul/problemes", proportionnalite: "calcul/proportionnalite", durees: "calcul/durees" },
  geometrie: { figures: "geometrie/figures", angles: "geometrie/angles", symetrie: "geometrie/symetrie", conversions: "mesures/conversions", "perimetre-aire": "mesures/perimetre-aire" },
};
export type Point = { notion: string; ok: number; n: number; date: string; source: "test" | "exercice" };
export function pointsFromAttempts(as: Att[]): Point[] {
  const out: Point[] = [];
  for (const a of as) {
    const m = ONE[a.subject]?.[a.itemId.trim()];
    if (m && a.max > 0) out.push({ notion: m, ok: a.score, n: a.max, date: a.date, source: "exercice" });
  }
  return out;
}

// ───────── Bilans (passations du test) ─────────
export type Passation = { date: string; notions: Record<string, { ok: number; n: number }> };
export const pointsFromPassations = (ps: Passation[]): Point[] =>
  ps.flatMap((p) => Object.entries(p.notions).map(([notion, v]) => ({ notion, ok: v.ok, n: v.n, date: p.date, source: "test" as const })));

// ───────── Statut par notion ─────────
export const poids = (date: string, now: Date) => 0.5 ** (Math.max(0, now.getTime() - new Date(date).getTime()) / 864e5 / DEMI_VIE_JOURS);
export type Etat = { notion: string; statut: Statut; pct: number | null; reponses: number };

export function statutDe(pct: number, reponses: number): Statut {
  if (reponses < MIN_REPONSES) return "inconnu";
  return pct >= SEUIL_ACQUIS ? "acquis" : pct >= SEUIL_EN_COURS ? "en-cours" : "a-travailler";
}
export function etats(points: Point[], now = new Date()): Etat[] {
  return NOTIONS.map(({ id }) => {
    const ps = points.filter((p) => p.notion === id);
    const reponses = ps.reduce((s, p) => s + p.n, 0);
    const w = ps.reduce((s, p) => s + p.n * poids(p.date, now), 0);
    const pct = w > 0 ? ps.reduce((s, p) => s + p.ok * poids(p.date, now), 0) / w : null;
    return { notion: id, pct, reponses, statut: pct === null ? "inconnu" : statutDe(pct, reponses) };
  });
}

const ORDRE: Record<Statut, number> = { "a-travailler": 0, "en-cours": 1, inconnu: 2, acquis: 3 };
/** 3 notions à travailler en priorité : les plus faibles d'abord, puis « en cours », puis non évaluées. */
export function recommandations(es: Etat[], n = 3): Etat[] {
  return es.filter((e) => e.statut !== "acquis")
    .sort((a, b) => ORDRE[a.statut] - ORDRE[b.statut] || (a.pct ?? 0.5) - (b.pct ?? 0.5)).slice(0, n);
}

/** Évolution entre les deux dernières passations. */
export function evolution(ps: Passation[]): { notion: string; avant: number; apres: number }[] {
  if (ps.length < 2) return [];
  const [a, b] = [...ps].sort((x, y) => x.date.localeCompare(y.date)).slice(-2);
  return Object.keys(b.notions).filter((k) => a.notions[k]?.n && b.notions[k].n)
    .map((k) => ({ notion: k, avant: a.notions[k].ok / a.notions[k].n, apres: b.notions[k].ok / b.notions[k].n }));
}

// ───────── Stockage local ─────────
const KEY = "revisions-cm2:bilans";
export function loadPassations(): Passation[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function savePassation(p: Passation) { localStorage.setItem(KEY, JSON.stringify([...loadPassations(), p])); }
export const resetPassations = () => localStorage.removeItem(KEY);

// ───────── Génération du test ─────────
export type TQ = { notion: string; consigne: string; contexte?: string; shape?: Shape; choix?: string[]; unite?: string; juste: (s: string) => boolean; reponse: string };
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
const shuffle = <T,>(r: Rng, xs: T[]) => xs.map((x) => [r(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

const GEN: Record<string, (r: Rng) => TQ> = {};
for (const t of TENSES) GEN[COURS_TEMPS[t]] = (r) => {
  const q = conjQs(1, [t], [1, 2, 3], r)[0];
  return { notion: COURS_TEMPS[t], consigne: `Conjugue « ${q.verb.infinitive} » au ${t.toLowerCase()}`, contexte: `${q.pronoun.trim()} …`, juste: (s) => checkConj(q, s), reponse: `${q.pronoun}${q.answer}` };
};
for (const t of CALCUL_THEMES) GEN[`calcul/${t.id}`] = (r) => {
  const q = calculQs(1, [t.id as CalculTheme], r)[0];
  return { notion: `calcul/${t.id}`, consigne: q.enonce, juste: (s) => checkCalcul(q, s), reponse: q.reponse };
};
const PT: [string, PType][] = [["calcul/problemes", "etapes"], ["calcul/proportionnalite", "proportionnalite"], ["calcul/durees", "durees"]];
for (const [id, type] of PT) GEN[id] = (r) => {
  const p = makeProblemes(1, [type], r)[0];
  return { notion: id, consigne: p.question, contexte: p.enonce, unite: p.unite, juste: (s) => checkProbleme(p, s), reponse: p.reponse };
};
const GT: [string, GTheme][] = [["geometrie/figures", "figures"], ["geometrie/angles", "angles"], ["geometrie/symetrie", "symetrie"], ["mesures/conversions", "conversions"], ["mesures/perimetre-aire", "perimetre-aire"]];
for (const [id, th] of GT) GEN[id] = (r) => {
  const q = makeGQ(1, [th], r)[0];
  return { notion: id, consigne: q.consigne, shape: q.shape, choix: q.choix, unite: q.unite, juste: (s) => checkGQ(q, s), reponse: q.reponse };
};
GEN["orthographe/homophones"] = (r) => {
  const h = pick(r, HOMOPHONES);
  return { notion: "orthographe/homophones", consigne: "Quel mot complète la phrase ?", contexte: h.phrase.replace("{}", "…"), choix: shuffle(r, h.choix), juste: (s) => s === h.bonne, reponse: h.bonne };
};
GEN["grammaire/natures"] = (r) => {
  const p = pick(r, PHRASES), qs = questionsFor(p, "nature").filter((q) => q.reponse.length === 1);
  const q = pick(r, qs.length ? qs : questionsFor(p, "nature")), i = q.reponse[0];
  const all = Object.keys(NATURE) as Nature[];
  return { notion: "grammaire/natures", consigne: `Quelle est la nature du mot « ${p.mots[i][0]} » ?`, contexte: p.mots.map((m) => m[0]).join(" "),
    choix: shuffle(r, [q.cible, ...shuffle(r, all.filter((n) => n !== q.cible)).slice(0, 3)]).map((n) => NATURE[n as Nature]), juste: (s) => s === NATURE[q.cible as Nature], reponse: NATURE[q.cible as Nature] };
};
GEN["grammaire/fonctions"] = (r) => {
  const p = pick(r, PHRASES.filter((x) => x.fonctions.length)), f = pick(r, p.fonctions);
  const groupe = p.mots.slice(f.debut, f.fin + 1).map((m) => m[0]).join(" ");
  const roles = ["S", "COD", "COI", "CCL", "CCT", "CCM", "ATT"] as Role[];
  const label = (x: Role) => ROLE[x].replace(/^(le |l')/, "");
  return { notion: "grammaire/fonctions", consigne: `Quelle est la fonction de « ${groupe} » ?`, contexte: p.mots.map((m) => m[0]).join(" "),
    choix: shuffle(r, [f.role, ...shuffle(r, roles.filter((x) => x !== f.role)).slice(0, 3)]).map((x) => label(x as Role)), juste: (s) => s === label(f.role), reponse: label(f.role) };
};

export function makeTest(r: Rng = Math.random, parNotion = PAR_NOTION): TQ[] {
  const out: TQ[] = [];
  for (const { id } of NOTIONS) {
    const seen = new Set<string>(), qs: TQ[] = [];
    for (let g = 0; qs.length < parNotion && g < 60; g++) {
      const q = GEN[id](r), k = q.consigne + (q.contexte ?? "") + JSON.stringify(q.shape ?? "");
      if (!seen.has(k)) { seen.add(k); qs.push(q); }
    }
    out.push(...qs);
  }
  return shuffle(r, out);
}
export const checkTQ = (q: TQ, s: string) => q.juste(q.choix ? s : s.trim());
