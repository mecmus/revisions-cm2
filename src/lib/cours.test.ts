import { describe, expect, it } from "vitest";
import { COURS, COURS_ERREUR, COURS_TEMPS, getCours } from "./cours";

describe("cours", () => {
  it("ids uniques et fiches complètes", () => {
    expect(new Set(COURS.map((c) => c.id)).size).toBe(COURS.length);
    for (const c of COURS) {
      expect(c.regle.length).toBeGreaterThan(20);
      expect(c.points.length).toBeGreaterThan(0);
      expect(c.exemples.length).toBeGreaterThan(0);
      expect(c.source).toBeTruthy();
    }
  });
  it("chaque temps et chaque type d'erreur a sa fiche", () => {
    for (const id of [...Object.values(COURS_TEMPS), ...Object.values(COURS_ERREUR)]) expect(getCours(id), id).toBeDefined();
  });
});
