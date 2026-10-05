import { describe, expect, it } from "vitest";
import { correct } from "./correction";
import { classify, summarize } from "./errorType";

const types = (exp: string, got: string) => correct(exp, got).tokens.map(classify).filter(Boolean);

describe("classification des erreurs", () => {
  it.each([
    ["Il a faim.", "Il à faim.", "homophone"],
    ["Elle est partie.", "Elle et partie.", "homophone"],
    ["Ils sont là.", "Ils son là.", "homophone"],
    ["les feuilles jaunes", "les feuilles jaune", "accord"],
    ["Les enfants bavardent.", "Les enfants bavarde.", "accord"],
    ["nous avons décidé de préparer", "nous avons décider de préparer", "accord"],
    ["la forêt", "la foret", "accent"],
    ["Ce matin, les élèves", "Ce matin, Les élèves", "majuscule"],
    ["la cour, les enfants", "la cour les enfants", "ponctuation"],
    ["le petit toit", "le toit", "oubli"],
    ["le toit", "le le toit", "ajout"],
    ["des champignons", "des champinions", "orthographe"],
  ])("%s / %s → %s", (exp, got, want) => {
    expect(types(exp, got)).toEqual([want]);
  });

  it("tolérances : ignore ponctuation et majuscules", () => {
    const r = correct("Ce matin, les élèves.", "ce matin les élèves");
    expect(summarize(r.tokens).errors).toBe(3);
    expect(summarize(r.tokens, { ignorePunctuation: true, ignoreCase: true }).errors).toBe(0);
  });
});
