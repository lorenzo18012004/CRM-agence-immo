# 💻 Développement Local

## 🚀 Lancer le projet en local

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **PostgreSQL** (via Supabase ou local)

---

## 📋 Configuration

### 1. Variables d'environnement

#### Backend (`server/.env`)

Créez un fichier `.env` dans le dossier `server/` :

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="votre-secret-jwt-super-securise"
NODE_ENV="development"
PORT=5000
```

**Pour obtenir `DATABASE_URL`** :
1. Allez sur **Supabase Dashboard** → Votre projet
2. **Settings** → **Database**
3. **Connection string** → Copiez l'URL

#### Frontend (`client/.env`)

Créez un fichier `.env` dans le dossier `client/` :

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Lancer le projet

### Option 1 : Lancer séparément (Recommandé pour le développement)

#### Terminal 1 : Backend

```bash
cd server
npm install
npm run dev
```

Le backend sera accessible sur : `http://localhost:5000`

#### Terminal 2 : Frontend

```bash
cd client
npm install
npm run dev
```

Le frontend sera accessible sur : `http://localhost:5173` (ou un autre port)

### Option 2 : Scripts npm (si configurés)

```bash
# Depuis la racine du projet
npm run dev:server  # Lance le backend
npm run dev:client  # Lance le frontend
```

---

## ✅ Vérification

1. **Backend** : Ouvrez `http://localhost:5000/api/health`
   - Vous devriez voir : `{"status":"OK","message":"CRM API is running"}`

2. **Frontend** : Ouvrez `http://localhost:5173`
   - Vous devriez voir la page de login

3. **Test de connexion** :
   - Code agence : `7890` ou `6165`
   - Email : `admin@example.com` (ou un autre utilisateur)
   - Password : `admin123` (ou `agent123`)

---

## 🔧 Commandes utiles

### Backend

```bash
cd server

# Développement (avec hot reload)
npm run dev

# Build
npm run build

# Production
npm start

# Prisma
npm run prisma:generate    # Générer Prisma Client
npm run prisma:migrate     # Exécuter les migrations
npm run prisma:studio      # Ouvrir Prisma Studio (interface graphique)
npm run prisma:seed        # Remplir la base avec des données de test
```

### Frontend

```bash
cd client

# Développement (avec hot reload)
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

---

## 📁 Structure des dossiers

```
CRM agence immo/
├── server/              # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/     # Routes API
│   │   ├── middleware/ # Middleware (auth, etc.)
│   │   └── index.ts    # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma # Schéma de base de données
│   │   └── seed.ts     # Données de test
│   ├── uploads/        # Fichiers uploadés (local uniquement)
│   └── .env           # Variables d'environnement backend
│
└── client/             # Frontend (React + Vite + Material-UI)
    ├── src/
    │   ├── pages/      # Pages de l'application
    │   ├── components/ # Composants réutilisables
    │   ├── contexts/   # Contextes React (Auth, etc.)
    │   └── App.tsx     # Point d'entrée React
    └── .env           # Variables d'environnement frontend
```

---

## 🐛 Debug

### Problème : Backend ne démarre pas

1. **Vérifiez `DATABASE_URL`** dans `server/.env`
2. **Vérifiez que Prisma Client est généré** :
   ```bash
   cd server
   npm run prisma:generate
   ```
3. **Vérifiez les logs** dans le terminal

### Problème : Frontend ne se connecte pas au backend

1. **Vérifiez `VITE_API_URL`** dans `client/.env` :
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
2. **Vérifiez que le backend tourne** sur le port 5000
3. **Vérifiez la console du navigateur** (F12)

### Problème : Erreur de base de données

1. **Vérifiez la connexion Supabase** :
   ```bash
   cd server
   npx prisma db pull
   ```
2. **Exécutez les migrations** :
   ```bash
   npm run prisma:migrate
   ```

---

## 🔄 Workflow de développement

1. **Lancez le backend** : `cd server && npm run dev`
2. **Lancez le frontend** : `cd client && npm run dev`
3. **Modifiez le code** → Les changements se rechargent automatiquement
4. **Testez** dans le navigateur
5. **Commit et push** quand vous êtes satisfait

---

## 📝 Notes importantes

### Uploads de fichiers

- **En local** : Les fichiers sont stockés dans `server/uploads/`
- **Sur Vercel** : Les fichiers sont stockés dans `/tmp/uploads` (temporaire)

**Pour la production** : Utilisez Supabase Storage ou un service cloud pour les fichiers permanents.

### Base de données

- **En local** : Vous utilisez la même base Supabase que la production
- **Attention** : Les modifications en local affectent la base de production !

**Pour éviter ça** : Créez une base de données de test séparée sur Supabase.

---

## 🎯 Avantages du développement local

✅ **Hot reload** : Les changements se rechargent automatiquement  
✅ **Debugging facile** : Console, breakpoints, etc.  
✅ **Pas de limite de déploiement** : Testez autant que vous voulez  
✅ **Plus rapide** : Pas besoin d'attendre les déploiements Vercel  
✅ **Logs en temps réel** : Voir les erreurs directement dans le terminal

---

## 🚀 Déploiement

Quand vous êtes prêt à déployer :

1. **Testez tout en local** d'abord
2. **Commit et push** sur GitHub
3. **Vercel déploie automatiquement** (si configuré)
4. **Ou déployez manuellement** depuis Vercel Dashboard

---

## 📚 Ressources

- **Prisma Docs** : https://www.prisma.io/docs
- **Vite Docs** : https://vitejs.dev
- **React Docs** : https://react.dev
- **Material-UI Docs** : https://mui.com

