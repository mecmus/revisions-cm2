"use client";

import { useCallback, useEffect, useRef } from "react";

const PONCT: Record<string, string> = { ",": " virgule", ".": " point", ";": " point-virgule", ":": " deux-points", "!": " point d'exclamation", "?": " point d'interrogation" };

/** Lit un fichier audio Piper ; repli sur la synthèse du navigateur s'il est indisponible. */
export function useDicteeAudio(rate: number) {
  const el = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { el.current?.pause(); if ("speechSynthesis" in window) speechSynthesis.cancel(); }, []);

  const fallback = useCallback((text: string, punct: boolean) => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const said = text.replace(/\bCM2\b/g, "C M 2").replace(/\bM\. /g, "Monsieur ");
    const u = new SpeechSynthesisUtterance(punct ? said.replace(/[,.;:!?]/g, (p) => PONCT[p] + " ") : said);
    u.lang = "fr-FR"; u.rate = rate * 0.8;
    speechSynthesis.speak(u);
  }, [rate]);

  return useCallback((src: string, text: string, punct = true) => {
    el.current?.pause();
    const a = new Audio(src);
    a.playbackRate = rate;
    a.preservesPitch = true;
    el.current = a;
    a.play().catch(() => fallback(text, punct));
  }, [rate, fallback]);
}
