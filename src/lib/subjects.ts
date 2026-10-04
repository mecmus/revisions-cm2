export type Subject = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  available: boolean;
};

export const subjects: Subject[] = [
  { slug: "dictees", title: "Dictées", emoji: "✍️", description: "Écoute, écris, puis corrige tes erreurs.", color: "from-indigo-500 to-violet-500", available: true },
  { slug: "conjugaison", title: "Conjugaison", emoji: "🔤", description: "Présent, imparfait, futur, passé composé…", color: "from-pink-500 to-rose-500", available: false },
  { slug: "grammaire", title: "Grammaire", emoji: "🧩", description: "Nature et fonction des mots, accords.", color: "from-amber-500 to-orange-500", available: false },
  { slug: "orthographe", title: "Orthographe", emoji: "🔎", description: "Homophones, pluriels, accords.", color: "from-emerald-500 to-teal-500", available: false },
  { slug: "maths", title: "Calcul & nombres", emoji: "➗", description: "Grands nombres, fractions, décimaux, calcul mental.", color: "from-sky-500 to-blue-500", available: false },
  { slug: "geometrie", title: "Géométrie & mesures", emoji: "📐", description: "Figures, périmètres, aires, angles.", color: "from-lime-500 to-green-600", available: false },
];
