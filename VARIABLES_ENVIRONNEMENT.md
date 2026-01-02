# 🔐 Variables d'environnement à configurer sur Vercel

## 📋 Variables pour le BACKEND

Dans votre projet **backend** sur Vercel, ajoutez ces variables :

### 1. DATABASE_URL
**Description** : URL de connexion à votre base de données Supabase PostgreSQL

**Comment l'obtenir** :
1. Allez sur votre projet Supabase
2. **Settings** → **Database**
3. Dans la section "Connection string", copiez l'URI
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données

**Format** :
```
postgresql://postgres:[VOTRE-MOT-DE-PASSE]@[HOST]:5432/postgres?sslmode=require
```

**Exemple** :
```
postgresql://postgres.xxxxx:VotreMotDePasse123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 2. JWT_SECRET
**Description** : Secret pour signer les tokens JWT (très important pour la sécurité)

**Comment le générer** :
- **Windows** : Utilisez PowerShell :
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
  ```
- **Ou en ligne** : https://randomkeygen.com/ (utilisez "CodeIgniter Encryption Keys")
- **Ou manuellement** : Créez une chaîne aléatoire d'au moins 32 caractères

**Exemple** :
```
aB3xK9mP2qR7vT5wY8zN1cF4hJ6gL0sD3fG7hJ9kL2mN5pQ8rS1tU4vW7xY0zA
```

**⚠️ IMPORTANT** : Gardez ce secret secret ! Ne le partagez jamais.

### 3. NODE_ENV
**Description** : Environnement d'exécution

**Valeur** :
```
production
```

---

## 📋 Variables pour le FRONTEND

Dans votre projet **frontend** sur Vercel, ajoutez cette variable :

### 1. VITE_API_URL
**Description** : URL de votre backend déployé sur Vercel

**Format** :
```
https://votre-backend.vercel.app/api
```

**Exemple** :
```
https://crm-backend-xyz123.vercel.app/api
```

**⚠️ IMPORTANT** : 
- Remplacez `votre-backend.vercel.app` par l'URL réelle de votre backend déployé
- L'URL doit se terminer par `/api`
- Vous trouverez cette URL dans votre projet backend Vercel → Overview

---

## 📝 Comment ajouter les variables sur Vercel

### Pour le Backend :

1. Allez sur votre projet backend sur Vercel
2. **Settings** → **Environment Variables**
3. Cliquez sur **Add New**
4. Ajoutez chaque variable :
   - **Key** : `DATABASE_URL`
   - **Value** : Votre URL Supabase
   - **Environment** : Sélectionnez `Production`, `Preview`, et `Development`
   - Cliquez sur **Save**

Répétez pour `JWT_SECRET` et `NODE_ENV`.

### Pour le Frontend :

1. Allez sur votre projet frontend sur Vercel
2. **Settings** → **Environment Variables**
3. Cliquez sur **Add New**
4. Ajoutez :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://votre-backend.vercel.app/api` (remplacez par votre URL)
   - **Environment** : Sélectionnez `Production`, `Preview`, et `Development`
   - Cliquez sur **Save**

---

## 🔄 Après avoir ajouté les variables

**⚠️ IMPORTANT** : Vous devez redéployer pour que les nouvelles variables soient prises en compte !

1. Allez dans **Deployments**
2. Cliquez sur les 3 points (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Attendez la fin du déploiement

---

## ✅ Checklist

- [ ] `DATABASE_URL` ajouté au backend (avec votre URL Supabase)
- [ ] `JWT_SECRET` ajouté au backend (secret fort généré)
- [ ] `NODE_ENV` ajouté au backend (= `production`)
- [ ] `VITE_API_URL` ajouté au frontend (avec l'URL de votre backend)
- [ ] Backend redéployé
- [ ] Frontend redéployé

---

## 🆘 Aide pour trouver votre DATABASE_URL

### Si vous ne connaissez pas votre mot de passe Supabase :

1. Allez sur Supabase
2. **Settings** → **Database**
3. Si vous avez oublié le mot de passe, vous pouvez le réinitialiser
4. Ou utilisez la "Connection string" qui utilise un pooler (recommandé)

### Format avec pooler (recommandé) :

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

Vous trouverez ces informations dans Supabase → Settings → Database → Connection string.

---

## 🔐 Sécurité

- ✅ Ne commitez **jamais** vos variables d'environnement
- ✅ Utilisez des secrets forts pour `JWT_SECRET`
- ✅ Ne partagez pas vos variables publiquement
- ✅ Vérifiez que les variables sont bien configurées dans Vercel

