import { describe, expect, it } from "vitest";
import { check, KINDS, makeQuestion, makeQuestions, norm, THEMES, type Kind, type Theme } from "./anglais";

const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const ALL_T = THEMES.map((t) => t.id) as Theme[], ALL_K = KINDS.map((k) => k.id) as Kind[];

describe("anglais : cohérence de chaque question", () => {
  it("la réponse affichée est toujours acceptée, pour 3000 questions tirées au hasard", () => {
    const r = seeded(7);
    for (let i = 0; i < 3000; i++) {
      for (const t of ALL_T) for (const k of ALL_K) {
        const q = makeQuestion(t, k, r);
        expect(q.answers.length, q.phrase).toBeGreaterThan(0);
        // la phrase complète affichée en solution doit contenir la réponse acceptée (forme pleine) ; pour les réponses courtes, elle est acceptée telle quelle
        const sol = norm(q.reponse);
        if (k === "reponse") expect(check(q, sol.replace(/^(yes|no), /, "")), `${q.phrase} → ${q.reponse}`).toBe(true);
        else expect(q.answers.some((a) => sol.includes(norm(a))), `${q.phrase} → ${q.reponse}`).toBe(true);
      }
    }
  });
  it("jamais de « cans », « to can », « has can » dans les réponses", () => {
    const r = seeded(3);
    for (let i = 0; i < 2000; i++) { const q = makeQuestion("can", ALL_K[i % 4], r); expect(q.reponse + q.phrase).not.toMatch(/\bcans\b|\bto can\b|\bdoes can\b/i); }
  });
  it("makeQuestions renvoie n questions sans doublon", () => {
    const qs = makeQuestions(10, ALL_T, ALL_K, seeded(1));
    expect(qs).toHaveLength(10);
    expect(new Set(qs.map((q) => q.phrase + q.consigne)).size).toBe(10);
  });
});


describe("anglais : to be", () => {
  const q = (subjectIdx: number) => makeQuestion("be", "affirmatif", (() => { const v = [0.0, subjectIdx / 12 + 0.001, 0.9]; let i = 0; return () => v[i++] ?? 0.9; })());
  it("accepte forme pleine et contractée", () => {
    const a = q(0);        // I
    expect(a.phrase.startsWith("I … ") || a.phrase.includes("…")).toBe(true);
    expect(check(a, "am") || check(a, "'m") || check(a, "is") || check(a, "are")).toBe(true);
  });
  it("norm gère l'apostrophe typographique et la casse", () => expect(norm("  Isn’t. ")).toBe("isn't"));
});

describe("anglais : règles de forme", () => {
  const r = seeded(11);
  const get = (t: Theme, k: Kind, f: (q: ReturnType<typeof makeQuestion>) => boolean) => { for (let i = 0; i < 4000; i++) { const q = makeQuestion(t, k, r); if (f(q)) return q; } throw new Error("introuvable"); };
  it("be : he → is, they → are, I → am", () => {
    expect(check(get("be", "affirmatif", (q) => q.phrase.startsWith("He ")), "is")).toBe(true);
    expect(check(get("be", "affirmatif", (q) => q.phrase.startsWith("They ")), "are")).toBe(true);
    expect(check(get("be", "affirmatif", (q) => q.phrase.startsWith("I ")), "am")).toBe(true);
    expect(check(get("be", "affirmatif", (q) => q.phrase.startsWith("I ")), "is")).toBe(false);
  });
  it("be négatif : isn't, is not, aren't, I'm not acceptés ; « am not » seulement pour I", () => {
    const he = get("be", "negatif", (q) => q.phrase.startsWith("He "));
    expect(check(he, "isn't") && check(he, "is not")).toBe(true);
    expect(check(he, "are not")).toBe(false);
    const we = get("be", "negatif", (q) => q.phrase.startsWith("We "));
    expect(check(we, "aren't")).toBe(true);
  });
  it("have got : has got pour he/she/it, have got sinon ; haven't / hasn't", () => {
    const she = get("have", "affirmatif", (q) => q.phrase.startsWith("She ") && q.consigne.includes("got"));
    expect(check(she, "has got") && check(she, "'s got")).toBe(true);
    expect(check(she, "have got")).toBe(false);
    const they = get("have", "negatif", (q) => q.phrase.startsWith("They ") && q.consigne.includes("got"));
    expect(check(they, "haven't got")).toBe(true);
    expect(check(they, "hasn't got")).toBe(false);
  });
  it("have sans got : has / do not have / doesn't have", () => {
    const he = get("have", "negatif", (q) => q.phrase.startsWith("He ") && !q.consigne.includes("got"));
    expect(check(he, "doesn't have")).toBe(true);
    expect(check(he, "hasn't got")).toBe(false);
    const q = get("have", "question", (q) => q.phrase.includes(" have ") && q.phrase.includes("she"));
    expect(check(q, "Does")).toBe(true);
    expect(check(q, "Do")).toBe(false);
  });
  it("can : une seule forme, can't / cannot acceptés, jamais « cans »", () => {
    const he = get("can", "affirmatif", (q) => q.phrase.startsWith("He "));
    expect(check(he, "can")).toBe(true);
    expect(check(he, "cans")).toBe(false);
    expect(check(he, "to can")).toBe(false);
    const n = get("can", "negatif", () => true);
    expect(check(n, "can't") && check(n, "cannot") && check(n, "can’t")).toBe(true);
  });
  it("réponses courtes : pronom + verbe, « you » → I", () => {
    const y = get("be", "reponse", (q) => q.phrase.startsWith("Are you") && q.phrase.includes("Yes"));
    expect(check(y, "I am") && check(y, "i am")).toBe(true);
    expect(check(y, "you are")).toBe(false);
    const n = get("can", "reponse", (q) => q.phrase.includes("No,") && q.phrase.startsWith("Can he"));
    expect(check(n, "he can't")).toBe(true);
    expect(check(n, "he can")).toBe(false);
  });
});
