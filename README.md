# CRM Agence Immobilière

Un CRM complet et professionnel pour la gestion d'une agence immobilière.

## Fonctionnalités

### 🏢 Gestion des Biens
- Création, modification et suppression de biens immobiliers
- Gestion des photos et documents
- Recherche et filtres avancés
- Statuts (disponible, vendu, loué, en attente)
- Types de biens (appartement, maison, terrain, local commercial, etc.)

### 📄 Gestion des Contrats
- Contrats de vente
- Contrats de location
- Suivi des échéances
- Génération automatique de documents
- Historique des contrats

### 📁 Gestion des Documents
- Upload et stockage de documents
- Catégorisation (contrats, factures, photos, etc.)
- Recherche et filtres
- Partage sécurisé

### 🌐 CMS pour Site Web
- Gestion des pages du site
- Éditeur de contenu riche
- Gestion des actualités/blog
- Galerie de photos
- Paramètres SEO

### 👥 Gestion de l'Agence
- Gestion des utilisateurs et rôles
- Calendrier et rendez-vous
- Suivi des clients (prospects, acheteurs, vendeurs)
- Statistiques et rapports
- Paramètres de l'agence

## Technologies

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Material-UI
- **Authentification**: JWT
- **Stockage**: Système de fichiers + cloud storage

## Installation

1. Installer toutes les dépendances :
```bash
npm run install:all
```

2. Configurer la base de données :
- Créer un fichier `.env` dans le dossier `server` avec :
```
DATABASE_URL="postgresql://user:password@localhost:5432/crm_immo"
JWT_SECRET="votre-secret-jwt"
PORT=5000
```

3. Initialiser la base de données :
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

4. Lancer l'application :
```bash
npm run dev
```

Le serveur backend sera disponible sur `http://localhost:5000`
Le frontend sera disponible sur `http://localhost:5173`

## Structure du Projet

```
├── server/          # Backend API
├── client/          # Frontend React
└── README.md
```

