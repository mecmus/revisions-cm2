import { describe, expect, it } from "vitest";
import { checkGQ, FIGURES, makeGQ, THEMES } from "./geometrie";

const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe("géométrie", () => {
  const qs = makeGQ(600, THEMES.map((t) => t.id), seeded(3));
  it("la réponse est toujours dans les choix et acceptée", () => {
    for (const q of qs) {
      if (q.choix) expect(q.choix).toContain(q.reponse);
      expect(checkGQ(q, q.reponse)).toBe(true);
    }
  });
  it("les figures dessinées ont bien leurs propriétés", () => {
    const sides = (n: string) => FIGURES[n].pts.map((p, i, a) => dist(p, a[(i + 1) % a.length]));
    expect(new Set(sides("carré")).size).toBe(1);
    expect(new Set(sides("losange")).size).toBe(1);
    const t = sides("triangle isocèle"); expect(t[0]).toBeCloseTo(t[2], 5);
    const e = sides("triangle équilatéral"); expect(Math.max(...e) - Math.min(...e)).toBeLessThan(2);
  });
  it("angles : le degré dessiné correspond à la réponse", () => {
    for (const q of qs.filter((x) => x.theme === "angles")) {
      const d = (q.shape as { deg: number }).deg;
      expect(q.reponse).toBe(d < 90 ? "aigu" : d === 90 ? "droit" : "obtus");
    }
  });
  it("symétrie : il y a des « oui » et des « non »", () => {
    const s = qs.filter((x) => x.theme === "symetrie").map((x) => x.reponse);
    expect(s).toContain("oui"); expect(s).toContain("non");
  });
  it("conversions : résultat recalculé depuis la consigne", () => {
    const U = [["km", "hm", "dam", "m", "dm", "cm", "mm"], ["kg", "hg", "dag", "g"], ["hL", "daL", "L", "dL", "cL", "mL"]];
    for (const q of qs.filter((x) => x.theme === "conversions")) {
      const m = q.consigne.match(/: ([\d ]+) (\w+) = \? (\w+)/)!;
      const us = U.find((u) => u.includes(m[2]) && u.includes(m[3]))!;
      const exp = +m[1].replace(/ /g, "") * 10 ** (us.indexOf(m[3]) - us.indexOf(m[2]));
      expect(+q.reponse.replace(/ /g, "").replace(",", "."), q.consigne).toBeCloseTo(exp, 6);
    }
  });
  it("conversions : exemples connus", () => {
    const q = { theme: "conversions" as const, consigne: "", reponse: "2,5", aide: "", cours: "" };
    expect(checkGQ(q, "2,5 km")).toBe(true);
  });
});
