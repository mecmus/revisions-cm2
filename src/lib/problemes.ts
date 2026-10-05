/** Problèmes à étapes générés (CM2) : chaque problème donne les étapes de la solution. */
import { fr, norm, type Rng } from "./calcul";

export type Type = "etapes" | "proportionnalite" | "durees" | "monnaie";
export type Probleme = { type: Type; enonce: string; question: string; reponse: string; unite: string; etapes: string[]; cours: string };
export const TYPES: { id: Type; label: string }[] = [
  { id: "etapes", label: "Problèmes à étapes" }, { id: "proportionnalite", label: "Proportionnalité" },
  { id: "durees", label: "Durées et horaires" }, { id: "monnaie", label: "Monnaie" },
];

const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];
const PRENOMS: [string, "Il" | "Elle"][] = [["Léa", "Elle"], ["Julien", "Il"], ["Sarah", "Elle"], ["Lucas", "Il"], ["Inès", "Elle"], ["Hugo", "Il"], ["Chloé", "Elle"], ["Adam", "Il"]];
const eur = (c: number) => `${fr(c / 100, 2)} €`;
const eurNum = (c: number) => fr(c / 100, 2).replace(/,00$/, "");
const hm = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
const duree = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`);

const GEN: Record<Type, (r: Rng) => Probleme> = {
  etapes: (r) => {
    const [p] = pick(r, PRENOMS);
    if (r() < 0.5) {
      const boites = int(r, 3, 9), par = int(r, 6, 24), mange = int(r, 5, boites * par - 1);
      return { type: "etapes", enonce: `${p} achète ${boites} boîtes de ${par} biscuits. Pendant la semaine, la famille en mange ${mange}.`,
        question: "Combien de biscuits reste-t-il ?", reponse: String(boites * par - mange), unite: "biscuits", cours: "calcul/problemes",
        etapes: [`Biscuits achetés : ${boites} × ${par} = ${boites * par}`, `Biscuits restants : ${boites * par} − ${mange} = ${boites * par - mange}`] };
    }
    const eleves = int(r, 20, 30), classes = int(r, 3, 6), car = pick(r, [40, 50, 60]);
    const total = eleves * classes, cars = Math.ceil(total / car);
    return { type: "etapes", enonce: `L'école organise une sortie. Il y a ${classes} classes de ${eleves} élèves. Un car peut transporter ${car} élèves.`,
      question: "Combien de cars faut-il réserver au minimum ?", reponse: String(cars), unite: "cars", cours: "calcul/problemes",
      etapes: [`Nombre d'élèves : ${classes} × ${eleves} = ${total}`, `${total} : ${car} = ${Math.floor(total / car)} reste ${total % car}`,
        total % car ? `Des élèves n'ont pas de place : il faut un car de plus, donc ${cars}` : `Pas de reste : ${cars} cars suffisent`] };
  },
  proportionnalite: (r) => {
    const [obj, un] = pick(r, [["cahiers", "cahier"], ["stylos", "stylo"], ["kg de pommes", "kg"]]);
    const n1 = int(r, 2, 6), prix = int(r, 80, 450), k = int(r, 2, 5), n2 = n1 * k;
    return { type: "proportionnalite", enonce: `${n1} ${obj} coûtent ${eur(n1 * prix)}. Le prix est proportionnel à la quantité.`,
      question: `Combien coûtent ${n2} ${obj} ?`, reponse: eurNum(n2 * prix), unite: "€", cours: "calcul/proportionnalite",
      etapes: [`${n2} ${obj}, c'est ${k} fois plus que ${n1}`, `Prix : ${eur(n1 * prix)} × ${k} = ${eur(n2 * prix)}`, `Autre méthode : 1 ${un} coûte ${eur(prix)}, puis × ${n2}`] };
  },
  durees: (r) => {
    const dep = int(r, 7 * 12, 20 * 12) * 5, d = int(r, 3, 48) * 5;
    if (r() < 0.5) return { type: "durees", enonce: `Un train part à ${hm(dep)}. Le trajet dure ${duree(d)}.`,
      question: "À quelle heure arrive-t-il ? (écris par exemple 14 h 05)", reponse: hm(dep + d), unite: "", cours: "calcul/durees",
      etapes: [`${hm(dep)} + ${Math.floor(d / 60)} h = ${hm(dep + Math.floor(d / 60) * 60)}`, `puis + ${d % 60} min = ${hm(dep + d)}`, "Rappel : 1 h = 60 min"] };
    return { type: "durees", enonce: `Un film commence à ${hm(dep)} et se termine à ${hm(dep + d)}.`,
      question: "Combien de minutes dure-t-il ?", reponse: String(d), unite: "min", cours: "calcul/durees",
      etapes: [`De ${hm(dep)} à ${hm(dep + d)} : ${Math.floor(d / 60)} h et ${d % 60} min`, `${Math.floor(d / 60)} × 60 + ${d % 60} = ${d} min`] };
  },
  monnaie: (r) => {
    const [p, pr] = pick(r, PRENOMS);
    const a = int(r, 150, 1200), b = int(r, 150, 1200), billet = a + b > 2000 ? 5000 : pick(r, [2000, 5000]);
    return { type: "monnaie", enonce: `${p} achète un livre à ${eur(a)} et un jeu à ${eur(b)}. ${pr} paie avec un billet de ${billet / 100} €.`,
      question: "Combien lui rend-on ?", reponse: eurNum(billet - a - b), unite: "€", cours: "calcul/problemes",
      etapes: [`Total : ${eur(a)} + ${eur(b)} = ${eur(a + b)}`, `Monnaie rendue : ${billet / 100} € − ${eur(a + b)} = ${eur(billet - a - b)}`] };
  },
};

export function makeProblemes(n: number, types: Type[], r: Rng = Math.random): Probleme[] {
  return Array.from({ length: n }, () => GEN[pick(r, types)](r));
}

const nh = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(":", "h").replace(/^(\d+)h(\d)$/, "$1h0$2").replace(/^(\d+)h$/, "$1h00");
export function checkProbleme(p: Probleme, s: string) {
  if (p.reponse.includes("h")) return nh(s) === nh(p.reponse);
  return norm(s.replace(/€|euros?|minutes?|min|cars?|biscuits?/gi, "")) === norm(p.reponse);
}
