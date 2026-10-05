import data from "../content/orthographe.json";

export type Faute = { index: number; original: string; fautif: string; type: string; regle: string; cours: string };
export type Chasse = { id: string; titre: string; source: string; texte: string; fautes: Faute[] };
export type Homophone = { id: string; phrase: string; bonne: string; choix: string[] };
export const CHASSES = data.chasse as Chasse[];
export const HOMOPHONES = data.homophones as Homophone[];

/** Sépare un mot de sa ponctuation finale. */
export const splitPunct = (w: string) => { const m = w.match(/^(.*?)([,.;:!?]*)$/)!; return [m[1], m[2]] as const; };

/** Mots du texte avec les fautes insérées. */
export function texteFautif(c: Chasse): string[] {
  const w = c.texte.split(" ");
  for (const f of c.fautes) w[f.index] = f.fautif + splitPunct(w[f.index])[1];
  return w;
}

const norm = (s: string) => s.trim().replace(/[’]/g, "'");
export const corrige = (f: Faute, saisie: string) => norm(saisie) === f.original;

export const shuffle = <T,>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);
export const COURS_HOMOPHONES = "orthographe/homophones";
