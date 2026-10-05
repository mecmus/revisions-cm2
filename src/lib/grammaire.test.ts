import { describe, expect, it } from "vitest";
import { isRight, makeQuestions, PHRASES, questionsFor } from "./grammaire";

describe("grammaire", () => {
  it("chaque phrase a sujet et verbe, et des fonctions sur des mots existants", () => {
    for (const p of PHRASES) {
      const roles = p.fonctions.map((f) => f.role);
      expect(roles, p.id).toContain("S");
      expect(roles, p.id).toContain("V");
      for (const f of p.fonctions) {
        expect(f.debut).toBeLessThanOrEqual(f.fin);
        for (let i = f.debut; i <= f.fin; i++) expect(p.mots[i][1], `${p.id} ${i}`).not.toBeNull();
      }
      const v = p.fonctions.find((f) => f.role === "V")!;
      for (let i = v.debut; i <= v.fin; i++) expect(p.mots[i][1]).toBe("V");
    }
  });
  it("questions de nature : la réponse contient exactement les mots de cette nature", () => {
    const q = questionsFor(PHRASES[0], "nature").find((x) => x.cible === "N")!;
    expect(q.reponse.map((i) => PHRASES[0].mots[i][0])).toEqual(["chat", "canapé"]);
    expect(isRight(q, [6, 2])).toBe(true);
    expect(isRight(q, [2])).toBe(false);
  });
  it("génère une série", () => {
    expect(makeQuestions(10, ["nature", "fonction"])).toHaveLength(10);
  });
});
