import { describe, expect, it } from "vitest";
import { dictees } from "./dictees";

describe("textes de dictée", () => {
  it.each(dictees.map((d) => [d.id, d.text]))("%s : pas de majuscule après une virgule", (_id, text) => {
    expect(text).not.toMatch(/[,;:]\s+(?!M\.)\p{Lu}/u);
  });
  it.each(dictees.map((d) => [d.id, d.source]))("%s : source citée", (_id, source) => {
    expect(source.length).toBeGreaterThan(10);
  });
});
