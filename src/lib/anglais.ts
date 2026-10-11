/**
 * Anglais CM2 : présent de be, have (got / do) et can.
 * Programme : attendus de fin d'année de CM2, anglais (BO n°31 du 30 juillet 2020), niveau A1 / A1+.
 */
import type { Rng } from "./calcul";

export type Theme = "be" | "have" | "can";
export type Kind = "affirmatif" | "negatif" | "question" | "reponse";
export const THEMES: { id: Theme; label: string }[] = [
  { id: "be", label: "to be (être)" }, { id: "have", label: "to have (avoir)" }, { id: "can", label: "can (pouvoir)" },
];
export const KINDS: { id: Kind; label: string }[] = [
  { id: "affirmatif", label: "Phrase affirmative" }, { id: "negatif", label: "Phrase négative" },
  { id: "question", label: "Question" }, { id: "reponse", label: "Réponse courte" },
];
export const COURS_ANGLAIS: Record<Theme, string> = { be: "anglais/be", have: "anglais/have", can: "anglais/can" };
export const SOURCE = "Programme du cycle 3, attendus de fin d'année de CM2 en anglais (BO n°31 du 30 juillet 2020)";

type Pers = "I" | "you" | "he" | "she" | "it" | "we" | "they";
type Subj = { text: string; pers: Pers; pron: string };
const S = (text: string, pers: Pers, pron = text): Subj => ({ text, pers, pron });
export const SUBJECTS: Subj[] = [
  S("I", "I"), S("you", "you"), S("he", "he"), S("she", "she"), S("it", "it"), S("we", "we"), S("they", "they"),
  S("Tom", "he", "he"), S("Mia", "she", "she"), S("the dog", "it", "it"), S("my parents", "they", "they"), S("Tom and I", "we", "we"),
];
/** Colle un sujet et une forme verbale : « I » + « 'm not » → « I'm not ». */
const join = (subj: string, v: string) => (v.startsWith("'") ? subj + v : `${subj} ${v}`);
const third = (p: Pers) => p === "he" || p === "she" || p === "it";

const BE_COMP = ["happy", "tired", "in the kitchen", "at school", "ready", "hungry", "ten years old", "from Spain"];
const HAVE_COMP = ["a brother", "a red bike", "two cats", "a new bag", "a blue pencil case", "a big house", "an English book"];
const CAN_COMP = ["swim", "play the guitar", "ride a bike", "run fast", "speak English", "draw a cat", "jump high"];

/** Formes acceptées pour chaque cas (la 1re est la forme pleine affichée comme réponse). */
const be = (p: Pers) => p === "I" ? { v: "am", neg: ["am not", "'m not"], c: "'m" } : third(p) ? { v: "is", neg: ["is not", "isn't", "'s not"], c: "'s" } : { v: "are", neg: ["are not", "aren't", "'re not"], c: "'re" };
const haveGot = (p: Pers) => third(p) ? { v: "has got", c: "'s got", neg: ["has not got", "hasn't got", "'s not got"], q: "Has", yes: "has", no: ["has not", "hasn't"] }
  : { v: "have got", c: "'ve got", neg: ["have not got", "haven't got", "'ve not got"], q: "Have", yes: "have", no: ["have not", "haven't"] };
const haveDo = (p: Pers) => third(p) ? { v: "has", neg: ["does not have", "doesn't have"], q: "Does", yes: "does", no: ["does not", "doesn't"] }
  : { v: "have", neg: ["do not have", "don't have"], q: "Do", yes: "do", no: ["do not", "don't"] };

export type Question = {
  theme: Theme; kind: Kind; phrase: string; /* avec « … » à la place du trou */ consigne: string;
  answers: string[]; reponse: string; /* phrase complète correcte */ regle: string; cours: string;
};

export const norm = (s: string) => s.toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim().replace(/[.!?]+$/g, "").trim();
/** Accepte la réponse avec ou sans contraction ; « cans », « to can »… restent faux. */
export const check = (q: Question, given: string) => { const g = norm(given); return q.answers.some((a) => norm(a) === g); };

const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const subjText = (s: Subj, start: boolean) => (start && s.text !== "I" && !/^[A-Z]/.test(s.text) ? cap(s.text) : s.text);

const RULES: Record<Theme, string> = {
  be: "to be : I am, you are, he/she/it is, we are, you are, they are. Négation : on ajoute not (isn't, aren't). Question : on inverse (Is she happy ?).",
  have: "have got : I/you/we/they have got, he/she/it has got. Négation : haven't / hasn't got. Question : Have you got… ? Has she got… ? Avec have seul : do / does (I don't have, Does she have… ?).",
  can: "can est un verbe modal : même forme à toutes les personnes (he can, pas « he cans »), jamais de « to » (I can swim), négation can't ou cannot, question : Can you… ?",
};

export function makeQuestion(theme: Theme, kind: Kind, r: Rng = Math.random): Question {
  const base = { theme, kind, regle: RULES[theme], cours: COURS_ANGLAIS[theme] };
  const useGot = theme === "have" && r() < 0.5;
  const comp = pick(r, theme === "be" ? BE_COMP : theme === "have" ? HAVE_COMP : CAN_COMP);
  // pour la réponse courte et la question, on évite « I » comme sujet de la question
  const subj = pick(r, kind === "reponse" || kind === "question" ? SUBJECTS.filter((s) => s.pers !== "I") : SUBJECTS);
  const p = subj.pers;
  const yes = r() < 0.5;

  if (theme === "be") {
    const f = be(p);
    if (kind === "affirmatif") return { ...base, consigne: "Complète avec la bonne forme de to be.", phrase: `${subjText(subj, true)} … ${comp}.`, answers: [f.v, f.c], reponse: `${subjText(subj, true)} ${f.v} ${comp}.` };
    if (kind === "negatif") return { ...base, consigne: "Mets la phrase à la forme négative (avec to be).", phrase: `${subjText(subj, true)} … ${comp}.`, answers: f.neg, reponse: `${join(subjText(subj, true), f.neg[1] ?? f.neg[0])} ${comp}.` };
    if (kind === "question") { const g = be(p); return { ...base, consigne: "Pose la question : complète avec to be.", phrase: `… ${subj.text} ${comp} ?`, answers: [cap(g.v)], reponse: `${cap(g.v)} ${subj.text} ${comp} ?` }; }
    const pr = subj.pron === "you" ? "I" : subj.pron, bp = be(pr as Pers);
    const q = `${cap(be(p).v)} ${subj.text} ${comp} ?`;
    return yes
      ? { ...base, consigne: "Réponds oui par une réponse courte (pronom + verbe).", phrase: `${q} Yes, …`, answers: [`${pr} ${bp.v}`], reponse: `Yes, ${pr} ${bp.v}.` }
      : { ...base, consigne: "Réponds non par une réponse courte (pronom + verbe).", phrase: `${q} No, …`, answers: bp.neg.map((n) => (n.startsWith("'") ? pr + n : `${pr} ${n}`)).concat(bp.neg.filter((n) => !n.startsWith("'") && n.includes("n't")).map((n) => `${pr} ${n}`)), reponse: `No, ${join(pr, bp.neg[1] ?? bp.neg[0])}.` };
  }

  if (theme === "have") {
    const subjP = p;
    if (useGot) {
      const f = haveGot(subjP);
      if (kind === "affirmatif") return { ...base, consigne: "Complète avec have got / has got.", phrase: `${subjText(subj, true)} … ${comp}.`, answers: [f.v, f.c], reponse: `${subjText(subj, true)} ${f.v} ${comp}.` };
      if (kind === "negatif") return { ...base, consigne: "Mets à la forme négative (have got).", phrase: `${subjText(subj, true)} … ${comp}.`, answers: f.neg, reponse: `${join(subjText(subj, true), f.neg[1] ?? f.neg[0])} ${comp}.` };
      if (kind === "question") return { ...base, consigne: "Pose la question avec have got : complète le début.", phrase: `… ${subj.text} got ${comp} ?`, answers: [f.q], reponse: `${f.q} ${subj.text} got ${comp} ?` };
      const pr = subj.pron === "you" ? "I" : subj.pron, ff = haveGot(pr as Pers);
      return yes ? { ...base, consigne: "Réponds oui par une réponse courte (pronom + verbe).", phrase: `${f.q} ${subj.text} got ${comp} ? Yes, …`, answers: [`${pr} ${ff.yes}`], reponse: `Yes, ${pr} ${ff.yes}.` }
        : { ...base, consigne: "Réponds non par une réponse courte (pronom + verbe).", phrase: `${f.q} ${subj.text} got ${comp} ? No, …`, answers: ff.no.map((n) => `${pr} ${n}`), reponse: `No, ${join(pr, ff.no[1])}.` };
    }
    const f = haveDo(subjP);
    if (kind === "affirmatif") return { ...base, consigne: "Complète avec have ou has.", phrase: `${subjText(subj, true)} … ${comp}.`, answers: [f.v], reponse: `${subjText(subj, true)} ${f.v} ${comp}.` };
    if (kind === "negatif") return { ...base, consigne: "Mets à la forme négative (have avec do / does).", phrase: `${subjText(subj, true)} … ${comp}.`, answers: f.neg, reponse: `${join(subjText(subj, true), f.neg[1] ?? f.neg[0])} ${comp}.` };
    if (kind === "question") return { ...base, consigne: "Pose la question avec Do / Does : complète le début.", phrase: `… ${subj.text} have ${comp} ?`, answers: [f.q], reponse: `${f.q} ${subj.text} have ${comp} ?` };
    const pr = subj.pron === "you" ? "I" : subj.pron, ff = haveDo(pr as Pers);
    return yes ? { ...base, consigne: "Réponds oui par une réponse courte (pronom + verbe).", phrase: `${f.q} ${subj.text} have ${comp} ? Yes, …`, answers: [`${pr} ${ff.yes}`], reponse: `Yes, ${pr} ${ff.yes}.` }
      : { ...base, consigne: "Réponds non par une réponse courte (pronom + verbe).", phrase: `${f.q} ${subj.text} have ${comp} ? No, …`, answers: ff.no.map((n) => `${pr} ${n}`), reponse: `No, ${join(pr, ff.no[1])}.` };
  }

  // can
  const pr = subj.pron === "you" ? "I" : subj.pron;
  if (kind === "affirmatif") return { ...base, consigne: "Complète avec can (une seule forme pour toutes les personnes).", phrase: `${subjText(subj, true)} … ${comp}.`, answers: ["can"], reponse: `${subjText(subj, true)} can ${comp}.` };
  if (kind === "negatif") return { ...base, consigne: "Mets à la forme négative (can).", phrase: `${subjText(subj, true)} … ${comp}.`, answers: ["can't", "cannot", "can not"], reponse: `${subjText(subj, true)} can't ${comp}.` };
  if (kind === "question") return { ...base, consigne: "Pose la question avec can : complète le début.", phrase: `… ${subj.text} ${comp} ?`, answers: ["Can"], reponse: `Can ${subj.text} ${comp} ?` };
  return yes ? { ...base, consigne: "Réponds oui par une réponse courte (pronom + verbe).", phrase: `Can ${subj.text} ${comp} ? Yes, …`, answers: [`${pr} can`], reponse: `Yes, ${pr} can.` }
    : { ...base, consigne: "Réponds non par une réponse courte (pronom + verbe).", phrase: `Can ${subj.text} ${comp} ? No, …`, answers: [`${pr} can't`, `${pr} cannot`, `${pr} can not`], reponse: `No, ${pr} can't.` };
}

export function makeQuestions(n: number, themes: Theme[], kinds: Kind[], r: Rng = Math.random): Question[] {
  const out: Question[] = [], seen = new Set<string>();
  for (let g = 0; out.length < n && g < n * 40; g++) {
    const q = makeQuestion(pick(r, themes), pick(r, kinds), r), k = q.phrase + q.consigne;
    if (!seen.has(k)) { seen.add(k); out.push(q); }
  }
  return out;
}
