export type Subject = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  available: boolean;
};
export type Category = { id: string; title: string; emoji: string; subjects: Subject[] };

/** Les cours sont mis en avant, avant les catégories d'exercices. */
export const cours: Subject = { slug: "cours", title: "Cours", emoji: "📘", description: "Les leçons : règles, exemples, pièges et astuces.", color: "from-sky-500 to-cyan-500", available: true };

export const categories: Category[] = [
  { id: "francais", title: "Français", emoji: "🇫🇷", subjects: [
    { slug: "dictees", title: "Dictées", emoji: "✍️", description: "Écoute, écris, puis corrige tes erreurs.", color: "from-indigo-500 to-violet-500", available: true },
    { slug: "conjugaison", title: "Conjugaison", emoji: "🔤", description: "Présent, imparfait, futur, passé composé…", color: "from-pink-500 to-rose-500", available: true },
    { slug: "grammaire", title: "Grammaire", emoji: "🧩", description: "Nature et fonction des mots.", color: "from-amber-500 to-orange-500", available: true },
    { slug: "chasse-aux-fautes", title: "Chasse aux fautes", emoji: "🕵️", description: "Trouve et corrige les fautes d'un texte.", color: "from-emerald-500 to-teal-500", available: true },
    { slug: "homophones", title: "Homophones", emoji: "🔁", description: "a/à, et/est, son/sont, on/ont…", color: "from-teal-500 to-cyan-600", available: true },
  ] },
  { id: "maths", title: "Mathématiques", emoji: "🔢", subjects: [
    { slug: "maths", title: "Calcul & nombres", emoji: "➗", description: "Calcul mental, opérations, décimaux, fractions, grands nombres.", color: "from-sky-500 to-blue-500", available: true },
    { slug: "problemes", title: "Problèmes", emoji: "🧮", description: "Problèmes à étapes, proportionnalité, durées, monnaie.", color: "from-violet-500 to-purple-600", available: true },
    { slug: "geometrie", title: "Géométrie & mesures", emoji: "📐", description: "Figures, périmètres, aires, angles.", color: "from-lime-500 to-green-600", available: false },
  ] },
];

export const subjects: Subject[] = [cours, ...categories.flatMap((c) => c.subjects)];
