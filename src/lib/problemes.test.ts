import { describe, expect, it } from "vitest";
import { checkProbleme, makeProblemes, TYPES } from "./problemes";

const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const num = (s: string) => +s.replace(/ /g, "").replace(",", ".");

describe("problèmes", () => {
  const ps = makeProblemes(400, TYPES.map((t) => t.id), seeded(7));
  it("réponses positives, étapes, et la réponse attendue est acceptée", () => {
    for (const p of ps) {
      expect(p.etapes.length, p.enonce).toBeGreaterThan(1);
      if (!p.reponse.includes("h")) expect(num(p.reponse), p.enonce).toBeGreaterThan(0);
      expect(checkProbleme(p, p.reponse), p.reponse).toBe(true);
    }
  });
  it("monnaie : rendu = billet − total (recalcul depuis l'énoncé)", () => {
    for (const p of ps.filter((x) => x.type === "monnaie")) {
      const n = [...p.enonce.matchAll(/(\d+(?:,\d+)?) €/g)].map((m) => num(m[1]));
      expect(num(p.reponse)).toBeCloseTo(n[2] - n[0] - n[1], 2);
    }
  });
  it("durées : film = fin − début (recalcul depuis l'énoncé)", () => {
    for (const p of ps.filter((x) => x.question.startsWith("Combien de minutes"))) {
      const [a, b] = [...p.enonce.matchAll(/(\d+) h (\d+)/g)].map((m) => +m[1] * 60 + +m[2]);
      expect(+p.reponse).toBe(b - a);
    }
  });
  it("horaires : formats acceptés", () => {
    const p = { type: "durees" as const, enonce: "", question: "", reponse: "14 h 05", unite: "", etapes: [], cours: "" };
    for (const s of ["14 h 05", "14h05", "14h5", "14:05"]) expect(checkProbleme(p, s), s).toBe(true);
    expect(checkProbleme(p, "14 h 50")).toBe(false);
  });
  it("unités tolérées dans la saisie", () => {
    const p = { type: "monnaie" as const, enonce: "", question: "", reponse: "7,5", unite: "€", etapes: [], cours: "" };
    expect(checkProbleme(p, "7,50 €")).toBe(true);
  });
});
