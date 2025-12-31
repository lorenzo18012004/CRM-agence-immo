# 🚀 Déploiement sur Vercel - Étape par Étape

## ✅ Prérequis terminés
- ✅ Tables créées dans Supabase
- ✅ Utilisateur admin créé
- ✅ Client Prisma généré

---

## 📋 ÉTAPE 1 : Installer Vercel CLI

Ouvrez un terminal et exécutez :

```bash
npm install -g vercel
```

Cela installe l'outil en ligne de commande de Vercel.

---

## 📋 ÉTAPE 2 : Se connecter à Vercel

```bash
vercel login
```

Cela ouvrira votre navigateur pour vous connecter à Vercel.
- Si vous n'avez pas de compte, créez-en un (gratuit)
- Connectez-vous avec GitHub, GitLab, ou email

---

## 📋 ÉTAPE 3 : Déployer le Backend

### 3.1 Aller dans le dossier server

```bash
cd server
```

### 3.2 Déployer

```bash
vercel
```

Répondez aux questions :
- **Set up and deploy?** → Tapez `Y` et Entrée
- **Which scope?** → Sélectionnez votre compte
- **Link to existing project?** → Tapez `N` et Entrée
- **Project name?** → Tapez `crm-backend` (ou autre nom) et Entrée
- **Directory?** → Tapez `.` (point) et Entrée
- **Override settings?** → Tapez `N` et Entrée

### 3.3 Ajouter les variables d'environnement

**Variable 1 : DATABASE_URL**

```bash
vercel env add DATABASE_URL
```

- **Value:** Collez votre URL Supabase complète (avec mot de passe encodé)
  Exemple : `postgresql://postgres:Lololili180104%2A@db.lukldmgetpsplnlwhlff.supabase.co:5432/postgres`
- **Environment:** Sélectionnez `Production, Preview, Development` (tapez `a` pour tout sélectionner)

**Variable 2 : JWT_SECRET**

```bash
vercel env add JWT_SECRET
```

- **Value:** Tapez un secret aléatoire long (ex: `ma-cle-secrete-tres-longue-et-aleatoire-123456789`)
- **Environment:** Sélectionnez `Production, Preview, Development` (tapez `a`)

### 3.4 Redéployer en production

```bash
vercel --prod
```

**⚠️ IMPORTANT :** Notez l'URL qui s'affiche à la fin (ex: `https://crm-backend.vercel.app`)
Vous en aurez besoin pour le frontend !

---

## 📋 ÉTAPE 4 : Configurer le Frontend

### 4.1 Modifier AuthContext.tsx

Ouvrez le fichier `client/src/contexts/AuthContext.tsx`

Trouvez cette ligne :
```typescript
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://votre-backend-url.vercel.app/api' : 'http://localhost:5000/api');
```

Remplacez `votre-backend-url.vercel.app` par l'URL réelle de votre backend Vercel (celle que vous avez notée à l'étape 3.4)

Exemple :
```typescript
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://crm-backend.vercel.app/api' : 'http://localhost:5000/api');
```

---

## 📋 ÉTAPE 5 : Déployer le Frontend

### 5.1 Aller dans le dossier client

```bash
cd ../client
```

### 5.2 Déployer

```bash
vercel
```

Répondez aux questions (similaire au backend) :
- **Set up and deploy?** → `Y`
- **Which scope?** → Votre compte
- **Link to existing project?** → `N`
- **Project name?** → `crm-frontend` (ou autre)
- **Directory?** → `.`
- **Override settings?** → `N`

### 5.3 Ajouter la variable d'environnement

```bash
vercel env add VITE_API_URL
```

- **Value:** `https://VOTRE-BACKEND-URL.vercel.app/api`
  (Remplacez VOTRE-BACKEND-URL par l'URL réelle de votre backend)
- **Environment:** `Production, Preview, Development` (tapez `a`)

### 5.4 Redéployer en production

```bash
vercel --prod
```

**🎉 Notez l'URL du frontend !** (ex: `https://crm-frontend.vercel.app`)

---

## ✅ ÉTAPE 6 : Tester votre Application

1. Ouvrez l'URL du frontend dans votre navigateur
2. Connectez-vous avec :
   - **Email** : `admin@example.com`
   - **Mot de passe** : `admin123`

---

## 🎉 C'est terminé !

Votre CRM est maintenant en ligne sur Vercel avec Supabase !

**URLs à retenir :**
- Frontend : `https://votre-frontend.vercel.app`
- Backend : `https://votre-backend.vercel.app`
- Supabase : https://app.supabase.com

---

## 🔧 Dépannage

### Erreur lors du déploiement
- Vérifiez que toutes les variables d'environnement sont bien ajoutées
- Redéployez avec `vercel --prod`

### Erreur de connexion au backend
- Vérifiez que `VITE_API_URL` pointe vers la bonne URL
- Vérifiez que le backend est bien déployé

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` dans Vercel est correcte
- Vérifiez que le mot de passe est bien encodé (`%2A` pour `*`)

