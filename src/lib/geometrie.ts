/** Géométrie et mesures (CM2) : questions générées, figures en SVG. */
import { fr, norm, type Rng } from "./calcul";

export type Theme = "figures" | "angles" | "symetrie" | "conversions" | "perimetre-aire";
export const THEMES: { id: Theme; label: string }[] = [
  { id: "figures", label: "Figures" }, { id: "angles", label: "Angles" }, { id: "symetrie", label: "Symétrie" },
  { id: "conversions", label: "Conversions" }, { id: "perimetre-aire", label: "Périmètres et aires" },
];
export type Shape =
  | { kind: "poly"; pts: [number, number][]; marks?: string[] }
  | { kind: "circle"; r: number }
  | { kind: "angle"; deg: number }
  | { kind: "grid"; w: number; h: number; cells: [number, number][]; axis: "v" | "h"; at: number }
  | { kind: "rect"; w: number; h: number; unit: string };
export type GQ = { theme: Theme; consigne: string; shape?: Shape; choix?: string[]; reponse: string; unite?: string; aide: string; cours: string };

const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
const shuffle = <T,>(r: Rng, xs: T[]) => xs.map((x) => [r(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

export const FIGURES: Record<string, { pts: [number, number][]; aide: string }> = {
  "carré": { pts: [[20, 20], [120, 20], [120, 120], [20, 120]], aide: "4 côtés égaux et 4 angles droits." },
  "rectangle": { pts: [[10, 35], [150, 35], [150, 105], [10, 105]], aide: "4 angles droits, côtés opposés égaux deux à deux." },
  "losange": { pts: [[80, 10], [140, 70], [80, 130], [20, 70]], aide: "4 côtés égaux, mais pas d'angle droit." },
  "triangle rectangle": { pts: [[20, 20], [20, 130], [140, 130]], aide: "Un triangle avec un angle droit." },
  "triangle équilatéral": { pts: [[80, 15], [145, 128], [15, 128]], aide: "Un triangle avec 3 côtés égaux." },
  "triangle isocèle": { pts: [[80, 10], [125, 130], [35, 130]], aide: "Un triangle avec 2 côtés égaux." },
  "trapèze": { pts: [[50, 30], [120, 30], [150, 120], [10, 120]], aide: "Un quadrilatère avec 2 côtés parallèles." },
  "parallélogramme": { pts: [[45, 30], [155, 30], [115, 115], [5, 115]], aide: "Côtés opposés parallèles et égaux, pas d'angle droit." },
};
const UNITES = { longueur: ["km", "hm", "dam", "m", "dm", "cm", "mm"], masse: ["kg", "hg", "dag", "g"], contenance: ["hL", "daL", "L", "dL", "cL", "mL"] };

const GEN: Record<Theme, (r: Rng) => GQ> = {
  figures: (r) => {
    const names = Object.keys(FIGURES), n = pick(r, names);
    const others = shuffle(r, names.filter((x) => x !== n)).slice(0, 3);
    return { theme: "figures", consigne: "Comment s'appelle cette figure ?", shape: { kind: "poly", pts: FIGURES[n].pts }, choix: shuffle(r, [n, ...others]), reponse: n, aide: FIGURES[n].aide, cours: "geometrie/figures" };
  },
  angles: (r) => {
    const t = pick(r, ["aigu", "droit", "obtus"]);
    const deg = t === "droit" ? 90 : t === "aigu" ? int(r, 3, 15) * 5 : int(r, 20, 34) * 5;
    return { theme: "angles", consigne: "Cet angle est-il aigu, droit ou obtus ?", shape: { kind: "angle", deg }, choix: ["aigu", "droit", "obtus"], reponse: t, aide: "Compare avec le coin d'une équerre : plus petit = aigu, égal = droit, plus grand = obtus.", cours: "geometrie/angles" };
  },
  symetrie: (r) => {
    const axis = pick(r, ["v", "h"] as const), w = 8, h = 8, at = 4;
    const half: [number, number][] = [];
    for (let i = 0; i < int(r, 4, 7); i++) half.push(axis === "v" ? [int(r, 0, 3), int(r, 0, 7)] : [int(r, 0, 7), int(r, 0, 3)]);
    const mirror = ([x, y]: [number, number]): [number, number] => (axis === "v" ? [2 * at - 1 - x, y] : [x, 2 * at - 1 - y]);
    const sym = r() < 0.5;
    const other = half.map(mirror);
    if (!sym) { const k = int(r, 0, other.length - 1); other[k] = axis === "v" ? [Math.min(7, other[k][0] + 1) === other[k][0] ? 4 : Math.min(7, other[k][0] + 1), (other[k][1] + 2) % 8] : [(other[k][0] + 2) % 8, Math.min(7, Math.max(4, other[k][1] + 1))]; }
    const key = (c: [number, number]) => c.join(",");
    const cells = [...new Map([...half, ...other].map((c) => [key(c), c])).values()];
    const isSym = cells.every((c) => cells.some((d) => key(d) === key(mirror(c))));
    return { theme: "symetrie", consigne: "La figure est-elle symétrique par rapport à l'axe rouge ?", shape: { kind: "grid", w, h, cells, axis, at }, choix: ["oui", "non"], reponse: isSym ? "oui" : "non", aide: "Plie la feuille sur l'axe dans ta tête : chaque case colorée doit tomber sur une case colorée.", cours: "geometrie/symetrie" };
  },
  conversions: (r) => {
    const [g, us] = pick(r, Object.entries(UNITES));
    let a = int(r, 0, us.length - 1), b = int(r, 0, us.length - 1);
    while (a === b || Math.abs(a - b) > 3) { a = int(r, 0, us.length - 1); b = int(r, 0, us.length - 1); }
    const v = b > a ? int(r, 1, 99) : int(r, 1, 999);
    const res = Math.round(v * 10 ** (b - a) * 1000) / 1000;
    return { theme: "conversions", consigne: `Convertis : ${fr(v)} ${us[a]} = ? ${us[b]}`, reponse: fr(res, Number.isInteger(res) ? 0 : 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, ""), unite: us[b], aide: `Tableau des unités de ${g} : ${us.join(" | ")}. Chaque colonne vaut 10 fois la suivante.`, cours: "mesures/conversions" };
  },
  "perimetre-aire": (r) => {
    const w = int(r, 2, 15), h = int(r, 2, 12), unit = pick(r, ["cm", "m"]), carre = r() < 0.25, H = carre ? w : h;
    const aire = r() < 0.5;
    return { theme: "perimetre-aire", consigne: `Calcule ${aire ? "l'aire" : "le périmètre"} de ce ${carre ? "carré" : "rectangle"}.`, shape: { kind: "rect", w, h: H, unit },
      reponse: String(aire ? w * H : 2 * (w + H)), unite: aire ? `${unit}²` : unit,
      aide: aire ? `Aire du rectangle = longueur × largeur = ${w} × ${H}` : `Périmètre = 2 × (longueur + largeur) = 2 × (${w} + ${H})`, cours: "mesures/perimetre-aire" };
  },
};

export function makeGQ(n: number, themes: Theme[], r: Rng = Math.random): GQ[] {
  return Array.from({ length: n }, () => GEN[pick(r, themes)](r));
}
export const checkGQ = (q: GQ, s: string) => (q.choix ? s === q.reponse : norm(s.replace(/[a-zA-Z²]+$/, "")) === norm(q.reponse));
