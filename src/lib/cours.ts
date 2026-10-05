import data from "../content/cours.json";
import type { ErrorType } from "./errorType";
import type { Tense } from "./conjugaison";

export type Cours = { id: string; matiere: string; titre: string; regle: string; points: string[]; exemples: string[]; pieges: string[]; astuce: string; source: string; valide: boolean };
export const COURS = data as Cours[];
export const getCours = (id: string) => COURS.find((c) => c.id === id);
export const coursHref = (id: string) => `/cours/${id}`;

export const COURS_TEMPS: Record<Tense, string> = {
  "Présent": "conjugaison/present", "Imparfait": "conjugaison/imparfait", "Passé simple": "conjugaison/passe-simple",
  "Futur simple": "conjugaison/futur", "Passé composé": "conjugaison/passe-compose",
};
export const COURS_ERREUR: Record<ErrorType, string> = {
  accord: "orthographe/accord", homophone: "orthographe/homophones", accent: "orthographe/accents",
  majuscule: "orthographe/majuscules", ponctuation: "orthographe/ponctuation",
  oubli: "orthographe/mots-oublies", ajout: "orthographe/mots-oublies", orthographe: "orthographe/mots",
};
