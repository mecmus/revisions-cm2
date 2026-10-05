import { describe, expect, it } from "vitest";
import { dictees } from "./dictees";

describe("textes de dictée", () => {
  it.each(dictees.map((d) => [d.id, d.text]))("%s : pas de majuscule après une virgule", (_id, text) => {
    // Après , ; : seule une majuscule de nom propre est permise (ex. vers de poème recopié tel quel = erreur)
    const PROPRES = /^(M|Lucas|Sarah|Léa|Julien|Honorine|Seguin|Lepic|Hamel|Paris)$/;
    const suspects = [...text.matchAll(/[,;:]\s+(\p{Lu}\p{L}*)/gu)].map((m) => m[1]).filter((w) => !PROPRES.test(w));
    expect(suspects).toEqual([]);
  });
  it("au moins 10 extraits du domaine public, avec niveau", () => {
    expect(dictees.filter((d) => d.origine === "domaine-public").length).toBeGreaterThanOrEqual(10);
    expect(dictees.every((d) => [1, 2, 3].includes(d.niveau))).toBe(true);
  });
  it("identifiants uniques", () => {
    expect(new Set(dictees.map((d) => d.id)).size).toBe(dictees.length);
  });
  it.each(dictees.map((d) => [d.id, d.text]))("%s : longueur adaptée au CM2 (20 à 80 mots)", (_id, text) => {
    const n = text.split(/\s+/).length;
    expect(n).toBeGreaterThanOrEqual(20);
    expect(n).toBeLessThanOrEqual(80);
  });
  it.each(dictees.map((d) => [d.id, d.source]))("%s : source citée", (_id, source) => {
    expect(source.length).toBeGreaterThan(10);
  });
});
