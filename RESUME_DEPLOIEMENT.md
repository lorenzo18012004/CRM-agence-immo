# 🚀 Résumé : Déploiement Vercel + Supabase

## ✅ Ce qui a été configuré

Tous les fichiers nécessaires ont été créés pour déployer votre CRM sur Vercel avec Supabase.

---

## 📋 Les 6 étapes à suivre

### 1️⃣ Créer un projet Supabase
- Allez sur https://supabase.com
- Créez un compte et un nouveau projet
- Notez le mot de passe de la base de données

### 2️⃣ Récupérer l'URL Supabase
- Settings → Database → Connection string → URI
- Copiez l'URL et remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 3️⃣ Configurer le backend local
- Modifiez `server/.env` avec l'URL Supabase
- Exécutez les migrations :
  ```bash
  cd server
  npx prisma migrate dev --name init
  npx prisma generate
  npm run prisma:seed
  ```

### 4️⃣ Déployer le backend sur Vercel
```bash
cd server
vercel
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel --prod
```

### 5️⃣ Configurer le frontend
- Modifiez `client/src/contexts/AuthContext.tsx`
- Remplacez `votre-backend-url.vercel.app` par l'URL réelle

### 6️⃣ Déployer le frontend sur Vercel
```bash
cd client
vercel
vercel env add VITE_API_URL
vercel --prod
```

---

## 📚 Documentation complète

- **GUIDE_RAPIDE_DEPLOIEMENT.txt** : Version texte simple
- **DEPLOIEMENT_VERCEL_SUPABASE.md** : Guide détaillé avec toutes les explications

---

## 🎯 Après le déploiement

Votre CRM sera accessible sur :
- Frontend : `https://votre-frontend.vercel.app`
- Backend : `https://votre-backend.vercel.app`

Connectez-vous avec :
- Email : `admin@example.com`
- Mot de passe : `admin123`

---

**Suivez le guide `DEPLOIEMENT_VERCEL_SUPABASE.md` pour les détails complets !**

