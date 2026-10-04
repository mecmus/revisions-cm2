import { describe, expect, it } from "vitest";
import { correct, countWords } from "./correction";

describe("correct", () => {
  it("aucune erreur pour un texte identique", () => {
    expect(correct("Le chat dort.", "Le chat dort.").errors).toBe(0);
  });
  it("détecte une faute d'accord", () => {
    const r = correct("les chèvres mangeaient", "les chèvre mangeaient");
    expect(r.errors).toBe(1);
    expect(r.tokens[1]).toMatchObject({ expected: "chèvres", given: "chèvre", ok: false });
  });
  it("détecte un mot oublié et la ponctuation", () => {
    expect(correct("Il pleut, il vente.", "Il pleut il vente").errors).toBe(2);
  });
  it("normalise l'apostrophe typographique", () => {
    expect(correct("l'aube", "l\u2019aube").errors).toBe(0);
  });
});

describe("countWords", () => {
  it("ignore la ponctuation et compte les mots composés une fois", () => {
    expect(countWords("Demain, dès l'aube, là-haut !")).toBe(4);
    expect(countWords("")).toBe(0);
  });
});
