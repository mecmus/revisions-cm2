import { describe, expect, it } from "vitest";
import { badges, etoiles, jour, lundi, serie, seriesSemaine, totalEtoiles, type Att } from "./motivation";

const at = (date: string, score = 5, max = 10, subject = "maths"): Att => ({ subject, itemId: "x", score, max, date });
const NOW = new Date(2026, 9, 14, 15, 0); // mercredi 14 octobre 2026, heure locale
const d = (jj: number, h = 10) => new Date(2026, 9, jj, h).toISOString();

describe("étoiles", () => {
  it("seuils 50 / 70 / 90 %", () => {
    expect([4, 5, 6, 7, 8, 9, 10].map((s) => etoiles(s, 10))).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect(etoiles(0, 0)).toBe(0);
  });
  it("total", () => expect(totalEtoiles([at(d(1), 10), at(d(2), 7), at(d(3), 2)])).toBe(5));
});

describe("série de jours", () => {
  it("compte les jours consécutifs, plusieurs séries le même jour = 1 jour", () => {
    expect(serie([at(d(14)), at(d(14, 18)), at(d(13)), at(d(12))], NOW)).toBe(3);
  });
  it("tient encore si rien aujourd'hui mais hier", () => expect(serie([at(d(13)), at(d(12))], NOW)).toBe(2));
  it("retombe à 0 après un jour sans exercice", () => expect(serie([at(d(12)), at(d(11))], NOW)).toBe(0));
  it("un trou coupe la série", () => expect(serie([at(d(14)), at(d(12))], NOW)).toBe(1));
  it("traverse un changement de mois", () => expect(serie([at(new Date(2026, 10, 1, 9).toISOString()), at(d(31))], new Date(2026, 10, 1, 20))).toBe(2));
});

describe("semaine", () => {
  it("la semaine commence le lundi", () => {
    expect(jour(lundi(NOW))).toBe("2026-10-12");
    expect(jour(lundi(new Date(2026, 9, 18, 23)))).toBe("2026-10-12"); // dimanche
    expect(jour(lundi(new Date(2026, 9, 19, 0, 1)))).toBe("2026-10-19");
  });
  it("ne compte que la semaine en cours", () => expect(seriesSemaine([at(d(11, 23)), at(d(12, 8)), at(d(13)), at(d(14))], NOW)).toBe(3));
});

describe("badges", () => {
  it("aucun badge sans historique", () => expect(badges([], NOW).every((b) => !b.obtenu)).toBe(true));
  it("premier pas, sans faute, série de 3", () => {
    const b = Object.fromEntries(badges([at(d(12), 10), at(d(13)), at(d(14))], NOW).map((x) => [x.id, x.obtenu]));
    expect(b).toMatchObject({ premier: true, parfait: true, serie3: true, serie7: false, dix: false });
  });
  it("explorateur : 4 matières distinctes", () => {
    const as = ["maths", "dictees", "grammaire", "geometrie"].map((s) => at(d(14), 5, 10, s));
    expect(badges(as, NOW).find((x) => x.id === "matieres4")!.obtenu).toBe(true);
  });
});
