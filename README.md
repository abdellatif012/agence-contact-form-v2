# Formulaire de contact — Test technique Tremplin

Intégration d'une maquette de page de contact pour le site web d'une agence (immobilière), avec enregistrement des données du formulaire en base de données.

---

## Captures d'écran

### Vue principale (desktop)
![Vue principale du formulaire](docs/screenshots/desktop.png)

### Avec des créneaux de disponibilité ajoutés
![Formulaire avec créneaux ajoutés](docs/screenshots/desktop-with-slots.png)

### Vue mobile (responsive)
![Vue mobile du formulaire](docs/screenshots/mobile.png)

---

## Stack technique & choix

| Outil | Version | Pourquoi ce choix |
|---|---|---|
| **Next.js** (App Router) | 16.x | Permet de gérer le front (page React) et le back (route API `/api/submissions`) dans un seul projet, ce qui est idéal pour un formulaire qui doit être à la fois affiché et enregistré côté serveur. |
| **React** | 19.x | Fourni nativement par Next.js, pour construire l'interface du formulaire de façon déclarative et réactive (gestion des créneaux ajoutés/supprimés en direct). |
| **TypeScript** | 5.x | Sécurise les échanges de données entre le formulaire, l'API et la base de données (types partagés dans `src/lib/types.ts`). |
| **Tailwind CSS** | 4.x | Permet de reproduire rapidement et avec précision les détails visuels de la maquette (coins arrondis, couleurs, espacements) sans écrire de CSS séparé. |
| **react-hook-form** | 7.x | Gère la validation des champs (obligatoire, format email, etc.) et l'état du formulaire sans re-render inutile, plus simple à lire qu'un formulaire 100% géré "à la main". |
| **Stockage fichier JSON** (`node:fs`) | natif | Pour la persistance des données, j'ai testé plusieurs librairies SQLite (Prisma, `node:sqlite`, `better-sqlite3`), mais toutes nécessitent soit une version récente de Node, soit la compilation d'un module natif — ce qui a posé des problèmes d'installation selon l'environnement (Windows sans Visual Studio Build Tools, notamment). J'ai donc opté pour un stockage fichier JSON fait à la main (`src/lib/db.ts`), qui fonctionne **instantanément, sans aucune dépendance ni compilation**, sur n'importe quel système avec Node ≥ 18. Le code est organisé en petites fonctions (`getAllSubmissions`, `saveSubmission`) pour pouvoir être remplacé facilement par une vraie base SQL en production. |

> **Note sur le stockage des données :** le fichier `src/lib/db.ts` crée automatiquement un fichier `data/submissions.json` au premier envoi du formulaire (le dossier `data/` est ignoré par git). Chaque soumission y est ajoutée comme un nouvel enregistrement, avec ses disponibilités associées. Aucune configuration manuelle n'est nécessaire.

### Structure du projet

```
src/
├── app/
│   ├── page.tsx                  → page d'accueil, affiche le formulaire
│   ├── layout.tsx                → layout racine (polices système, fond)
│   └── api/submissions/route.ts  → route API (POST = enregistrer, GET = lister)
├── components/
│   ├── ContactForm.tsx           → le formulaire complet (logique + UI)
│   └── ChevronIcon.tsx           → petite icône réutilisée pour les selects
└── lib/
    ├── db.ts                     → lecture/écriture des données (fichier JSON)
    ├── types.ts                  → types partagés (jours, civilités, etc.)
    └── validation.ts             → validation des données côté serveur
```

Une explication détaillée, fichier par fichier, se trouve dans **[`EXPLICATIONS_DU_CODE.md`](./EXPLICATIONS_DU_CODE.md)**.

---

## Lancement du projet

**Prérequis :** Node.js ≥ 18 et npm.

```bash
# 1. Cloner le dépôt
git clone https://github.com/abdellatif012/agence-contact-form-v2.git
cd agence-contact-form-v2

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Le site est ensuite accessible sur [http://localhost:3000](http://localhost:3000).

À chaque envoi du formulaire, un nouvel enregistrement est ajouté dans `data/submissions.json` (fichier créé automatiquement au premier envoi). Vous pouvez vérifier le contenu enregistré via :

```bash
curl http://localhost:3000/api/submissions
```

ou simplement en ouvrant le fichier `data/submissions.json` dans un éditeur de texte.

### Build de production

```bash
npm run build
npm run start
```
