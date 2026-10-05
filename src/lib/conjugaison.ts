import data from "../content/conjugaison.json";

export type Tense = "Présent" | "Imparfait" | "Passé simple" | "Futur simple" | "Passé composé";
export type Verb = { infinitive: string; group: number; forms: Record<Tense, string[]> };
export type Question = { verb: Verb; tense: Tense; person: number; pronoun: string; answer: string };

export const TENSES = data.tenses as Tense[];
export const VERBS = data.verbs as Verb[];
export const SOURCE = data.source;
const PRONOUNS = ["je", "tu", "il", "nous", "vous", "ils"];

/** « je » s'élide devant voyelle ou h muet : j'aime, j'ai. */
export function pronoun(person: number, form: string): string {
  return person === 0 && /^[aeiouyhéèêâîôû]/i.test(form) ? "j'" : PRONOUNS[person] + " ";
}

export const RULES: Record<Tense, string> = {
  "Présent": "1er groupe : -e, -es, -e, -ons, -ez, -ent. 2e groupe : -is, -is, -it, -issons, -issez, -issent. Être, avoir, aller, faire, dire… sont à apprendre par cœur.",
  "Imparfait": "Mêmes terminaisons pour tous les verbes : -ais, -ais, -ait, -ions, -iez, -aient (radical du « nous » au présent : nous finissons → je finissais).",
  "Passé simple": "1er groupe : -ai, -as, -a, -âmes, -âtes, -èrent. 2e groupe et beaucoup du 3e : -is, -is, -it, -îmes, -îtes, -irent. Au CM2 on l'emploie surtout à la 3e personne.",
  "Futur simple": "Infinitif + -ai, -as, -a, -ons, -ez, -ont (je chanterai). Radicaux irréguliers : être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, pouvoir → pourr-, voir → verr-, vouloir → voudr-.",
  "Passé composé": "Auxiliaire être ou avoir au présent + participe passé. Avec être, le participe s'accorde avec le sujet (ils sont allés).",
};

const norm = (s: string) => s.normalize("NFC").replace(/[\u2019]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

/** Accepte la forme seule (« finissons ») ou avec le pronom (« nous finissons »). */
export function check(q: Question, given: string): boolean {
  const g = norm(given).replace(/^(je |j'|tu |il |elle |on |nous |vous |ils |elles )/, "");
  return g === norm(q.answer);
}

export function makeQuestions(n: number, tenses: Tense[], groups: number[], rnd: () => number = Math.random): Question[] {
  const verbs = VERBS.filter((v) => groups.includes(v.group));
  const qs: Question[] = [];
  const seen = new Set<string>();
  for (let guard = 0; qs.length < n && guard < 500; guard++) {
    const verb = verbs[Math.floor(rnd() * verbs.length)];
    const tense = tenses[Math.floor(rnd() * tenses.length)];
    const person = Math.floor(rnd() * 6);
    const key = `${verb.infinitive}|${tense}|${person}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const answer = verb.forms[tense][person];
    qs.push({ verb, tense, person, pronoun: pronoun(person, answer), answer });
  }
  return qs;
}
