# Guide de déploiement sur Vercel

Ce guide vous explique comment déployer votre CRM sur Vercel en deux projets séparés (backend et frontend).

## 📋 Prérequis

1. Un compte Vercel (gratuit) : https://vercel.com
2. Une base de données PostgreSQL (recommandé : Supabase, Neon, ou Railway)
3. Git installé sur votre machine
4. Le projet commité sur GitHub/GitLab/Bitbucket

## 🗄️ Étape 1 : Configurer la base de données

### Option A : Supabase (Recommandé - Gratuit)

1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet
3. Récupérez votre URL de connexion PostgreSQL
4. Dans l'onglet SQL Editor, exécutez votre schéma Prisma ou importez votre base

### Option B : Neon (Gratuit)

1. Créez un compte sur https://neon.tech
2. Créez un nouveau projet
3. Récupérez votre URL de connexion

### Option C : Railway (Gratuit avec crédits)

1. Créez un compte sur https://railway.app
2. Créez une nouvelle base PostgreSQL
3. Récupérez votre URL de connexion

## 🔧 Étape 2 : Préparer le projet

### 2.1 Variables d'environnement

Créez un fichier `.env.example` dans le dossier `server/` avec :

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="votre-secret-jwt-tres-long-et-securise"
NODE_ENV="production"
PORT=5000
```

### 2.2 Vérifier les fichiers de configuration

Les fichiers `vercel.json` sont déjà configurés dans les dossiers `server/` et `client/`.

## 🚀 Étape 3 : Déployer le Backend (Server)

### 3.1 Via l'interface Vercel

1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub
3. **Important** : Configurez le projet comme suit :
   - **Root Directory** : `server`
   - **Framework Preset** : Other
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. Ajoutez les variables d'environnement :
   - `DATABASE_URL` : Votre URL de connexion PostgreSQL
   - `JWT_SECRET` : Un secret aléatoire long (générez-en un avec `openssl rand -base64 32`)
   - `NODE_ENV` : `production`

5. Cliquez sur "Deploy"

6. Une fois déployé, notez l'URL de votre backend (ex: `https://votre-backend.vercel.app`)

### 3.2 Via CLI Vercel

```bash
cd server
vercel
# Suivez les instructions
# Ajoutez les variables d'environnement :
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

## 🎨 Étape 4 : Déployer le Frontend (Client)

### 4.1 Mettre à jour l'URL de l'API

Dans `client/src/contexts/AuthContext.tsx`, l'URL de l'API est déjà configurée pour utiliser `VITE_API_URL`.

### 4.2 Via l'interface Vercel

1. Allez sur https://vercel.com/new
2. Importez le même repository GitHub
3. **Important** : Configurez le projet comme suit :
   - **Root Directory** : `client`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. Ajoutez la variable d'environnement :
   - `VITE_API_URL` : L'URL de votre backend (ex: `https://votre-backend.vercel.app/api`)

5. Cliquez sur "Deploy"

### 4.3 Via CLI Vercel

```bash
cd client
vercel
# Suivez les instructions
# Ajoutez la variable d'environnement :
vercel env add VITE_API_URL
```

## 📝 Étape 5 : Configurer Prisma en production

### 5.1 Générer le client Prisma

Le script `vercel-build` dans `server/package.json` génère automatiquement le client Prisma.

### 5.2 Appliquer les migrations

Vous pouvez soit :
- Exécuter les migrations manuellement sur votre base de données
- Utiliser Prisma Migrate dans un script de build
- Utiliser Prisma Studio en local pour synchroniser

## 🔐 Étape 6 : Sécurité et optimisations

### 6.1 CORS

Le backend est déjà configuré avec CORS. Assurez-vous que votre frontend URL est autorisée si nécessaire.

### 6.2 Uploads de fichiers

Pour les uploads de fichiers, vous devrez utiliser un service de stockage externe comme :
- **Vercel Blob Storage** (recommandé)
- **AWS S3**
- **Cloudinary**
- **Supabase Storage**

Les fichiers uploadés localement ne persistent pas sur Vercel (système de fichiers éphémère).

## 🧪 Étape 7 : Tester le déploiement

1. Vérifiez que le backend répond : `https://votre-backend.vercel.app/api/health`
2. Testez l'authentification
3. Testez les fonctionnalités principales

## 🔄 Mises à jour futures

Pour mettre à jour votre application :

```bash
git add .
git commit -m "Votre message"
git push
```

Vercel déploiera automatiquement les changements.

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Prisma avec Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## ⚠️ Notes importantes

1. **Base de données** : Assurez-vous que votre base de données accepte les connexions depuis Vercel (whitelist IP si nécessaire)
2. **Uploads** : Les fichiers uploadés ne persistent pas sur Vercel, utilisez un service de stockage externe
3. **Variables d'environnement** : Ne commitez jamais vos fichiers `.env`
4. **JWT Secret** : Utilisez un secret fort et unique en production

