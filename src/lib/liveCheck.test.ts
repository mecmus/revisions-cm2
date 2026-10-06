import { describe, expect, it } from "vitest";
import { completed, liveCheck } from "./liveCheck";

const T = "Les enfants jouent dans le jardin.";
const mark = (s: string) => liveCheck(T, s).map((w) => `${w.text}${w.ok ? "+" : "-"}`).join(" ");

describe("liveCheck", () => {
  it("n'évalue pas le mot en cours de frappe", () => {
    expect(completed("Les enf")).toBe("Les ");
    expect(completed("Les enfants ")).toBe("Les enfants ");
    expect(completed("Les enfants jouent dans le jardin.")).toBe("Les enfants jouent dans le jardin.");
    expect(mark("Les enf")).toBe("Les+");
    expect(mark("")).toBe("");
  });
  it("marque juste et faux", () => expect(mark("Les enfant jouent ")).toBe("Les+ enfant- jouent+"));
  it("une erreur n'entraîne pas la suite en faux (oubli d'un mot)", () => expect(mark("Les enfants dans le ")).toBe("Les+ enfants+ dans+ le+"));
  it("un mot en trop est marqué faux, la suite reste juste", () => expect(mark("Les petits enfants jouent ")).toBe("Les+ petits- enfants+ jouent+"));
  it("la ponctuation compte", () => expect(mark("Les enfants jouent dans le jardin, ")).toContain(",-"));
  it("ne révèle jamais le mot attendu", () => {
    for (const w of liveCheck(T, "Le enfants ")) expect(Object.keys(w).sort()).toEqual(["ok", "text"]);
  });
});
