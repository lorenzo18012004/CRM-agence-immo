# 🚀 ÉTAPE FINALE : Déploiement sur Vercel

## ✅ Ce qui a été fait

1. ✅ Projet Supabase créé
2. ✅ Tables créées dans Supabase
3. ✅ Client Prisma généré
4. ⏳ Utilisateur admin à créer (via SQL)

---

## 📝 ÉTAPE 1 : Créer l'utilisateur admin

### Dans Supabase SQL Editor :

1. Ouvrez **SQL Editor** dans Supabase
2. Créez une nouvelle requête
3. Ouvrez le fichier **`CREER_ADMIN.sql`**
4. Copiez tout le contenu et collez-le dans Supabase
5. Cliquez sur **"Run"**

Cela créera :
- Utilisateur admin : `admin@example.com` / `admin123`
- Paramètres par défaut de l'agence

---

## 🌐 ÉTAPE 2 : Déployer le Backend sur Vercel

### 2.1 Installer Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Se connecter à Vercel

```bash
vercel login
```

### 2.3 Déployer le backend

```bash
cd server
vercel
```

Répondez aux questions :
- Set up and deploy? → **Y**
- Which scope? → Votre compte
- Link to existing project? → **N**
- Project name? → `crm-backend` (ou autre)
- Directory? → **.** (point)
- Override settings? → **N**

### 2.4 Ajouter les variables d'environnement

```bash
vercel env add DATABASE_URL
```
- Value: Votre URL Supabase complète (avec mot de passe encodé)
- Environment: **Production, Preview, Development**

```bash
vercel env add JWT_SECRET
```
- Value: Un secret aléatoire long (ex: `ma-cle-secrete-tres-longue-et-aleatoire-123456`)
- Environment: **Production, Preview, Development**

### 2.5 Redéployer

```bash
vercel --prod
```

**Notez l'URL du backend** (ex: `https://crm-backend.vercel.app`)

---

## 🎨 ÉTAPE 3 : Déployer le Frontend sur Vercel

### 3.1 Configurer l'URL de l'API

Modifiez `client/src/contexts/AuthContext.tsx` :

Trouvez cette ligne et remplacez `votre-backend-url.vercel.app` par l'URL réelle de votre backend :

```typescript
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://VOTRE-BACKEND-URL.vercel.app/api' : 'http://localhost:5000/api');
```

### 3.2 Déployer le frontend

```bash
cd client
vercel
```

Répondez aux questions (similaire au backend)

### 3.3 Ajouter la variable d'environnement

```bash
vercel env add VITE_API_URL
```
- Value: `https://VOTRE-BACKEND-URL.vercel.app/api`
- Environment: **Production, Preview, Development**

### 3.4 Redéployer

```bash
vercel --prod
```

**Notez l'URL du frontend** (ex: `https://crm-frontend.vercel.app`)

---

## ✅ ÉTAPE 4 : Tester votre application

1. Ouvrez l'URL du frontend dans votre navigateur
2. Connectez-vous avec :
   - Email : `admin@example.com`
   - Mot de passe : `admin123`

---

## 🎉 C'est terminé !

Votre CRM est maintenant en ligne sur Vercel avec Supabase !

