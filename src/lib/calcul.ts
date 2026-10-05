/** Générateurs d'exercices de calcul (CM2). Aléatoire injectable pour les tests. */
export type Rng = () => number;
export type Theme = "mental" | "operations" | "decimaux" | "fractions" | "grands-nombres";
export type Q = { theme: Theme; enonce: string; reponse: string; aide: string; cours: string };

export const THEMES: { id: Theme; label: string }[] = [
  { id: "mental", label: "Calcul mental" }, { id: "operations", label: "Opérations" },
  { id: "decimaux", label: "Nombres décimaux" }, { id: "fractions", label: "Fractions" }, { id: "grands-nombres", label: "Grands nombres" },
];

const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
/** Écrit un nombre à la française : espace des milliers, virgule décimale. */
export const fr = (n: number, dec = 0) => n.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\u202f|\u00a0/g, " ");
const trimDec = (s: string) => (s.includes(",") ? s.replace(/0+$/, "").replace(/,$/, "") : s);

const GEN: Record<Theme, (r: Rng) => Q> = {
  mental: (r) => {
    const k = pick(r, ["table", "x10", "div", "complement"]);
    if (k === "table") { const a = int(r, 2, 9), b = int(r, 2, 9); return { theme: "mental", enonce: `${a} × ${b} = ?`, reponse: String(a * b), aide: "Récite la table.", cours: "calcul/mental" }; }
    if (k === "x10") { const a = int(r, 2, 99), m = pick(r, [10, 100, 1000]); return { theme: "mental", enonce: `${a} × ${fr(m)} = ?`, reponse: fr(a * m), aide: `Multiplier par ${fr(m)}, c'est ajouter ${String(m).length - 1} zéro(s) à un nombre entier.`, cours: "calcul/mental" }; }
    if (k === "div") { const b = int(r, 2, 9), q = int(r, 2, 9); return { theme: "mental", enonce: `${b * q} : ${b} = ?`, reponse: String(q), aide: `Cherche dans la table de ${b}.`, cours: "calcul/mental" }; }
    const a = int(r, 1, 99); return { theme: "mental", enonce: `${a} + ? = 100`, reponse: String(100 - a), aide: "Complète d'abord jusqu'à la dizaine suivante, puis jusqu'à 100.", cours: "calcul/mental" };
  },
  operations: (r) => {
    const k = pick(r, ["+", "-", "×", ":"]);
    if (k === "+") { const a = int(r, 1000, 99999), b = int(r, 100, 9999); return { theme: "operations", enonce: `${fr(a)} + ${fr(b)} = ?`, reponse: fr(a + b), aide: "Pose l'opération : unités sous unités, n'oublie pas les retenues.", cours: "calcul/operations" }; }
    if (k === "-") { const a = int(r, 1000, 99999), b = int(r, 100, a - 1); return { theme: "operations", enonce: `${fr(a)} − ${fr(b)} = ?`, reponse: fr(a - b), aide: "Pose l'opération, le plus grand nombre en haut.", cours: "calcul/operations" }; }
    if (k === "×") { const a = int(r, 12, 999), b = int(r, 12, 99); return { theme: "operations", enonce: `${fr(a)} × ${b} = ?`, reponse: fr(a * b), aide: "Multiplie par les unités, puis par les dizaines (décale d'un rang), puis additionne.", cours: "calcul/operations" }; }
    const b = int(r, 2, 25), q = int(r, 11, 999); return { theme: "operations", enonce: `${fr(b * q)} : ${b} = ?`, reponse: fr(q), aide: "Division posée : combien de fois le diviseur dans les premiers chiffres ?", cours: "calcul/operations" };
  },
  decimaux: (r) => {
    const k = pick(r, ["+", "-", "x10", "compare"]);
    const d = () => int(r, 1, 9999) / 100;
    if (k === "+") { const a = d(), b = d(); return { theme: "decimaux", enonce: `${fr(a, 2)} + ${fr(b, 2)} = ?`, reponse: trimDec(fr(Math.round((a + b) * 100) / 100, 2)), aide: "Aligne les virgules.", cours: "calcul/decimaux" }; }
    if (k === "-") { let a = d(), b = d(); if (b > a) [a, b] = [b, a]; return { theme: "decimaux", enonce: `${fr(a, 2)} − ${fr(b, 2)} = ?`, reponse: trimDec(fr(Math.round((a - b) * 100) / 100, 2)), aide: "Aligne les virgules ; complète avec des zéros si besoin.", cours: "calcul/decimaux" }; }
    if (k === "x10") { const a = d(), m = pick(r, [10, 100]); return { theme: "decimaux", enonce: `${fr(a, 2)} × ${m} = ?`, reponse: trimDec(fr(Math.round(a * m * 100) / 100, 2)), aide: `× ${m} : chaque chiffre prend une valeur ${m} fois plus grande (la virgule « avance » de ${String(m).length - 1} rang).`, cours: "calcul/decimaux" }; }
    const a = d(); let b = d(); while (a === b) b = d();
    return { theme: "decimaux", enonce: `Écris < ou > : ${fr(a, 2)} … ${fr(b, 2)}`, reponse: a < b ? "<" : ">", aide: "Compare d'abord les parties entières, puis les dixièmes, puis les centièmes.", cours: "calcul/decimaux" };
  },
  fractions: (r) => {
    const k = pick(r, ["of", "add", "dec"]);
    if (k === "of") { const den = pick(r, [2, 3, 4, 5, 10]), num = int(r, 1, den - 1), n = den * int(r, 2, 12); return { theme: "fractions", enonce: `Combien font ${num}/${den} de ${n} ?`, reponse: String((n / den) * num), aide: `Divise ${n} par ${den}, puis multiplie par ${num}.`, cours: "calcul/fractions" }; }
    if (k === "add") { const den = pick(r, [4, 5, 6, 8, 10]), a = int(r, 1, den - 1), b = int(r, 1, den - 1); return { theme: "fractions", enonce: `${a}/${den} + ${b}/${den} = ?/${den}`, reponse: String(a + b), aide: "Même dénominateur : on additionne les numérateurs.", cours: "calcul/fractions" }; }
    const [f, v] = pick(r, [["1/2", "0,5"], ["1/4", "0,25"], ["3/4", "0,75"], ["1/10", "0,1"], ["7/10", "0,7"], ["1/100", "0,01"], ["35/100", "0,35"], ["3/2", "1,5"]]);
    return { theme: "fractions", enonce: `Écris ${f} sous forme de nombre décimal.`, reponse: v, aide: "1/10 = 0,1 ; 1/100 = 0,01 ; 1/2 = 0,5 ; 1/4 = 0,25.", cours: "calcul/fractions" };
  },
  "grands-nombres": (r) => {
    const n = int(r, 1_000_000, 999_999_999);
    const k = pick(r, ["chiffre", "arrondi"]);
    if (k === "chiffre") {
      const [nom, p] = pick(r, [["des unités de mille", 3], ["des centaines de mille", 5], ["des millions", 6], ["des dizaines de millions", 7], ["des centaines", 2]] as [string, number][]);
      return { theme: "grands-nombres", enonce: `Dans ${fr(n)}, quel est le chiffre ${nom} ?`, reponse: String(Math.floor(n / 10 ** p) % 10), aide: "Range les chiffres par classes de 3 : millions | milliers | unités.", cours: "calcul/grands-nombres" };
    }
    return { theme: "grands-nombres", enonce: `Arrondis ${fr(n)} au million le plus proche.`, reponse: fr(Math.round(n / 1e6) * 1e6), aide: "Regarde le chiffre des centaines de mille : 5 ou plus → on arrondit au-dessus.", cours: "calcul/grands-nombres" };
  },
};

export function makeQuestions(n: number, themes: Theme[], r: Rng = Math.random): Q[] {
  return Array.from({ length: n }, () => GEN[pick(r, themes)](r));
}

/** Compare la réponse en ignorant espaces, et en acceptant le point comme virgule. */
export const norm = (s: string) => s.replace(/\s|\u202f|\u00a0/g, "").replace(".", ",").replace(/^(\d+),?0*$/, "$1").replace(/(,\d*?)0+$/, "$1");
export const check = (q: Q, s: string) => norm(s) === norm(q.reponse);
