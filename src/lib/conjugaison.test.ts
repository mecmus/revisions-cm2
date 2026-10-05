import { describe, expect, it } from "vitest";
import { check, makeQuestions, pronoun, TENSES, VERBS } from "./conjugaison";

const v = (inf: string) => VERBS.find((x) => x.infinitive === inf)!;

describe("tables de référence (Wiktionnaire)", () => {
  it("contient 22 verbes × 5 temps × 6 personnes", () => {
    expect(VERBS).toHaveLength(22);
    for (const verb of VERBS) for (const t of TENSES) expect(verb.forms[t]).toHaveLength(6);
  });
  it.each([
    ["finir", "Présent", 3, "finissons"], ["aller", "Futur simple", 0, "irai"], ["être", "Imparfait", 5, "étaient"],
    ["manger", "Imparfait", 3, "mangions"], ["appeler", "Présent", 5, "appellent"], ["faire", "Passé simple", 2, "fit"],
    ["venir", "Passé composé", 5, "sont venus"], ["prendre", "Passé composé", 0, "ai pris"], ["pouvoir", "Futur simple", 1, "pourras"],
    ["commencer", "Passé simple", 2, "commença"], ["dire", "Présent", 4, "dites"], ["acheter", "Présent", 0, "achète"],
  ] as const)("%s, %s, personne %i → %s", (inf, t, p, f) => expect(v(inf).forms[t][p]).toBe(f));
});

describe("moteur", () => {
  const q = { verb: v("finir"), tense: "Présent" as const, person: 3, pronoun: "nous ", answer: "finissons" };
  it("accepte forme seule, avec pronom, majuscules et espaces", () => {
    for (const a of ["finissons", "nous finissons", "  Nous  Finissons "]) expect(check(q, a)).toBe(true);
    expect(check(q, "finisons")).toBe(false);
  });
  it("élision de je", () => {
    expect(pronoun(0, "ai pris")).toBe("j'");
    expect(pronoun(0, "irai")).toBe("j'");
    expect(pronoun(0, "chante")).toBe("je ");
  });
  it("série de 10 questions sans doublon, filtres respectés", () => {
    const qs = makeQuestions(10, ["Imparfait"], [2]);
    expect(qs).toHaveLength(10);
    expect(new Set(qs.map((x) => x.verb.infinitive + x.person)).size).toBe(10);
    expect(qs.every((x) => x.tense === "Imparfait" && x.verb.group === 2)).toBe(true);
  });
});
