# 📚 Révisions CM2

Application web (PWA) de révision pour élèves de CM2 : dictées avec correction, conjugaison, grammaire, orthographe, calcul, géométrie.
Utilisable sur PC, Mac, tablette et smartphone, installable sur l'écran d'accueil.

- **Stack** : Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Vitest
- **Dictées** : synthèse vocale du navigateur (Web Speech API), correction mot à mot
- **Progression** : stockée localement dans le navigateur (aucun compte, aucune donnée personnelle collectée)
- **Hébergement** : image `ghcr.io/mecmus/revisions-cm2`, déployée sur Kubernetes → https://cm2.mous.ovh

## Développement
```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run build
```

## Docker
```bash
docker build -t revisions-cm2 .
docker run -p 3000:3000 revisions-cm2
```

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour le workflow Gitflow / agile.

## Licence
Code : MIT. Textes de dictées : domaine public (source indiquée pour chaque texte).
