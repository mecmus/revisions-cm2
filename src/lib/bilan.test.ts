import { describe, expect, it } from "vitest";
import { checkTQ, etats, evolution, makeTest, NOTIONS, pointsFromAttempts, poids, recommandations, statutDe, type Point } from "./bilan";
import { getCours } from "./cours";

const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const NOW = new Date("2026-10-10T12:00:00Z");
const pt = (notion: string, ok: number, n: number, date = "2026-10-10T12:00:00Z"): Point => ({ notion, ok, n, date, source: "exercice" });

describe("seuils", () => {
  it("≥ 80 % acquis, 50-79 % en cours, < 50 % à travailler, min. 3 réponses", () => {
    expect(statutDe(0.8, 5)).toBe("acquis");
    expect(statutDe(0.79, 5)).toBe("en-cours");
    expect(statutDe(0.5, 5)).toBe("en-cours");
    expect(statutDe(0.49, 5)).toBe("a-travailler");
    expect(statutDe(1, 2)).toBe("inconnu");
  });
});

describe("pondération du récent", () => {
  it("un poids qui décroît de moitié par 30 jours", () => {
    expect(poids("2026-10-10T12:00:00Z", NOW)).toBeCloseTo(1);
    expect(poids("2026-09-10T12:00:00Z", NOW)).toBeCloseTo(0.5, 1);
  });
  it("un résultat récent pèse plus qu'un ancien", () => {
    const e = etats([pt("calcul/fractions", 0, 10, "2026-06-01T00:00:00Z"), pt("calcul/fractions", 9, 10)], NOW).find((x) => x.notion === "calcul/fractions")!;
    expect(e.pct!).toBeGreaterThan(0.8);
    const inverse = etats([pt("calcul/fractions", 10, 10, "2026-06-01T00:00:00Z"), pt("calcul/fractions", 1, 10)], NOW).find((x) => x.notion === "calcul/fractions")!;
    expect(inverse.statut).toBe("a-travailler");
  });
});

describe("historique", () => {
  it("compte une série mono-notion, ignore les séries mélangées", () => {
    const ps = pointsFromAttempts([
      { subject: "maths", itemId: "fractions", score: 8, max: 10, date: "2026-10-09" },
      { subject: "maths", itemId: "mental+fractions", score: 8, max: 10, date: "2026-10-09" },
      { subject: "conjugaison", itemId: "Présent", score: 5, max: 10, date: "2026-10-09" },
      { subject: "dictees", itemId: "x", score: 5, max: 10, date: "2026-10-09" },
    ]);
    expect(ps.map((p) => p.notion)).toEqual(["calcul/fractions", "conjugaison/present"]);
  });
});

describe("recommandations et évolution", () => {
  it("3 exercices : les plus faibles d'abord, jamais les acquis", () => {
    const es = etats([pt("calcul/fractions", 1, 5), pt("calcul/mental", 4, 5), pt("geometrie/angles", 2, 4), pt("calcul/decimaux", 3, 5)], NOW);
    const r = recommandations(es).map((e) => e.notion);
    expect(r).toHaveLength(3);
    expect(r[0]).toBe("calcul/fractions");
    expect(r).not.toContain("calcul/mental");
  });
  it("évolution entre les deux dernières passations", () => {
    const e = evolution([
      { date: "2026-09-01", notions: { "calcul/mental": { ok: 1, n: 3 } } },
      { date: "2026-10-01", notions: { "calcul/mental": { ok: 3, n: 3 } } },
    ]);
    expect(e).toEqual([{ notion: "calcul/mental", avant: 1 / 3, apres: 1 }]);
  });
});

describe("test de positionnement", () => {
  const test = makeTest(seeded(11));
  it("3 questions par notion, toutes les notions couvertes", () => {
    for (const n of NOTIONS) expect(test.filter((q) => q.notion === n.id).length, n.id).toBe(3);
    expect(test).toHaveLength(NOTIONS.length * 3);
  });
  it("chaque notion a une fiche de cours", () => {
    for (const n of NOTIONS) expect(getCours(n.id), n.id).toBeTruthy();
  });
  it("la bonne réponse est acceptée, et présente dans les choix", () => {
    for (let s = 1; s < 6; s++) for (const q of makeTest(seeded(s))) {
      if (q.choix) expect(q.choix, q.consigne).toContain(q.reponse);
      expect(checkTQ(q, q.reponse), `${q.notion} ${q.consigne} → ${q.reponse}`).toBe(true);
    }
  });
  it("une mauvaise réponse est refusée", () => {
    for (const q of test.filter((x) => x.choix)) expect(checkTQ(q, q.choix!.find((c) => c !== q.reponse)!), q.consigne).toBe(false);
  });
});
