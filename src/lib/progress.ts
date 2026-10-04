"use client";

export type Attempt = { subject: string; itemId: string; score: number; max: number; date: string };
const KEY = "revisions-cm2:progress";

export function loadAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveAttempt(a: Omit<Attempt, "date">) {
  const all = loadAttempts();
  all.push({ ...a, date: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function resetProgress() { localStorage.removeItem(KEY); }
