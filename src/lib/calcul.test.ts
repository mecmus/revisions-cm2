import { describe, expect, it } from "vitest";
import { check, fr, makeQuestions, THEMES } from "./calcul";

// petit générateur pseudo-aléatoire reproductible
const seeded = (s: number) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

describe("calcul", () => {
  it("fr écrit à la française", () => { expect(fr(1234567)).toBe("1 234 567"); expect(fr(3.5, 2)).toBe("3,50"); });
  it("check tolère espaces, point décimal et zéros finaux", () => {
    const q = { theme: "decimaux" as const, enonce: "", reponse: "12,5", aide: "", cours: "" };
    for (const s of ["12,5", "12.5", " 12,50 "]) expect(check(q, s), s).toBe(true);
    expect(check(q, "125")).toBe(false);
    expect(check({ ...q, reponse: "1 200" }, "1200")).toBe(true);
  });
  it("les réponses générées sont justes (recalcul)", () => {
    const qs = makeQuestions(500, THEMES.map((t) => t.id), seeded(42));
    let checked = 0;
    for (const q of qs) {
      const e = q.enonce.replace(/ (?=\d{3})/g, "").replace(/,/g, ".");
      let m;
      if ((m = e.match(/^([\d.]+) ([+−×:]) ([\d.]+) = \?$/))) {
        const a = +m[1], b = +m[3];
        const v = { "+": a + b, "−": a - b, "×": a * b, ":": a / b }[m[2] as "+"]!;
        expect(+q.reponse.replace(/ /g, "").replace(",", "."), q.enonce).toBeCloseTo(v, 6);
        checked++;
      }
      if ((m = e.match(/^([\d.]+) \+ \? = 100$/))) expect(+m[1] + +q.reponse).toBe(100);
      expect(q.reponse.length).toBeGreaterThan(0);
    }
    expect(checked).toBeGreaterThan(100);
  });
});
