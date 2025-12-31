# 🚀 Déploiement Simple - Version Rapide

## ⚡ En 3 étapes seulement !

### ÉTAPE 1 : Installer et se connecter à Vercel (1 minute)

```bash
npm install -g vercel
vercel login
```

---

### ÉTAPE 2 : Déployer le Backend (2 minutes)

```bash
cd server
vercel
```

Quand on vous demande, répondez :
- `Y` pour setup
- `N` pour link existing
- Nom du projet : `crm-backend`
- Directory : `.`

Puis ajoutez les variables :

```bash
vercel env add DATABASE_URL
# Collez votre URL Supabase complète

vercel env add JWT_SECRET
# Tapez : ma-cle-secrete-123456789

vercel --prod
```

**Notez l'URL du backend** (ex: `https://crm-backend-xxx.vercel.app`)

---

### ÉTAPE 3 : Déployer le Frontend (2 minutes)

```bash
cd ../client
```

**Modifiez d'abord** `client/src/contexts/AuthContext.tsx` :
Remplacez `votre-backend-url.vercel.app` par l'URL réelle de votre backend.

Puis :

```bash
vercel
```

Répondez de la même manière, puis :

```bash
vercel env add VITE_API_URL
# Tapez : https://VOTRE-BACKEND-URL.vercel.app/api

vercel --prod
```

---

## ✅ C'est tout !

Ouvrez l'URL du frontend et connectez-vous avec `admin@example.com` / `admin123`

---

**Total : 5 minutes maximum !**

