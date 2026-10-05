import { describe, expect, it } from "vitest";
import { dictees } from "../content/dictees";
import { CHASSES, corrige, HOMOPHONES, splitPunct, texteFautif } from "./orthographe";
import { getCours } from "./cours";

describe("chasse aux fautes", () => {
  it("le texte de base est identique à la dictée source (domaine public)", () => {
    for (const c of CHASSES) expect(c.texte).toBe(dictees.find((d) => d.id === c.id)?.text);
  });
  it("chaque faute porte sur le bon mot original et diffère de lui", () => {
    for (const c of CHASSES) {
      const w = c.texte.split(" ");
      for (const f of c.fautes) {
        expect(splitPunct(w[f.index])[0], `${c.id} ${f.index}`).toBe(f.original);
        expect(f.fautif).not.toBe(f.original);
        expect(getCours(f.cours)).toBeDefined();
      }
      expect(texteFautif(c).filter((x, i) => x !== w[i])).toHaveLength(c.fautes.length);
    }
  });
  it("corrige accepte l'apostrophe typographique", () => {
    const f = { index: 0, original: "c'était", fautif: "s'était", type: "homophone", regle: "", cours: "" };
    expect(corrige(f, " c’était ")).toBe(true);
    expect(corrige(f, "s'était")).toBe(false);
  });
});

describe("homophones", () => {
  it("une seule place à remplir et la bonne réponse parmi les choix", () => {
    for (const h of HOMOPHONES) {
      expect(h.phrase.split("{}")).toHaveLength(2);
      expect(h.choix).toContain(h.bonne);
      expect(new Set(h.choix).size).toBe(h.choix.length);
    }
  });
});
