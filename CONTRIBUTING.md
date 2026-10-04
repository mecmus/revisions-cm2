# Contribuer — Gitflow + Scrum

## Branches (Gitflow)
| Branche | Rôle |
|---|---|
| `main` | Production (cm2.mous.ovh). Uniquement via `release/*` ou `hotfix/*`. Chaque merge = tag `vX.Y.Z`. |
| `develop` | Intégration. Base de toutes les features. |
| `feature/<n°-issue>-<slug>` | Une user story. PR vers `develop`. |
| `release/X.Y.0` | Stabilisation de fin de sprint. PR vers `main` puis back-merge dans `develop`. |
| `hotfix/X.Y.Z` | Correctif urgent depuis `main`, mergé dans `main` et `develop`. |

Les branches `main` et `develop` sont protégées : PR + CI verte obligatoires.

## Commits
[Conventional Commits](https://www.conventionalcommits.org/fr/) : `feat:`, `fix:`, `docs:`, `chore:`, `test:`…

## Agile
- Sprints de 2 semaines = milestones GitHub.
- Backlog = issues `user-story`, priorisées dans le GitHub Project « Révisions CM2 ».
- Colonnes : Backlog → Sprint → En cours → En revue → Terminé.
- Definition of Done : voir le template de PR.

## Contenu pédagogique
Uniquement des sources vérifiables : programme du cycle 3 (BO n°16 du 17 avril 2025) et textes du domaine public pour les dictées. Toujours citer la source.
