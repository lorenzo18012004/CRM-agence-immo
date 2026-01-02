# 🚀 Déploiement Vercel - Guide Étape par Étape

Puisque vous avez déjà Supabase configuré, voici les étapes pour déployer sur Vercel.

## 📋 Checklist avant de commencer

- [x] Base de données Supabase configurée
- [ ] Compte Vercel créé (https://vercel.com)
- [ ] Code poussé sur GitHub/GitLab/Bitbucket
- [ ] URL de connexion Supabase disponible

## 🎯 Étape 1 : Déployer le Backend

### 1.1 Créer le projet Backend sur Vercel

1. Allez sur **https://vercel.com/new**
2. **Importez votre repository** GitHub
3. **Configurez le projet** :
   ```
   Project Name: crm-backend (ou le nom que vous voulez)
   Framework Preset: Other
   Root Directory: server
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 1.2 Ajouter les variables d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `DATABASE_URL` | Votre URL Supabase | `postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require` |
| `JWT_SECRET` | Secret aléatoire | Générez avec : `openssl rand -base64 32` |
| `NODE_ENV` | `production` | `production` |

**Où trouver votre DATABASE_URL Supabase :**
1. Allez sur votre projet Supabase
2. Settings → Database
3. Copiez la "Connection string" (URI)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 1.3 Déployer

Cliquez sur **"Deploy"** et attendez la fin du déploiement.

### 1.4 Noter l'URL du backend

Une fois déployé, vous verrez une URL comme : `https://crm-backend-xyz.vercel.app`

**⚠️ IMPORTANT : Notez cette URL, vous en aurez besoin pour le frontend !**

---

## 🎨 Étape 2 : Déployer le Frontend

### 2.1 Créer le projet Frontend sur Vercel

1. Allez sur **https://vercel.com/new** (nouveau projet)
2. **Importez le même repository** GitHub
3. **Configurez le projet** :
   ```
   Project Name: crm-frontend (ou le nom que vous voulez)
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 2.2 Ajouter la variable d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://votre-backend.vercel.app/api` |

**Remplacez `votre-backend.vercel.app` par l'URL de votre backend déployé à l'étape 1.4**

### 2.3 Déployer

Cliquez sur **"Deploy"** et attendez la fin du déploiement.

---

## ✅ Étape 3 : Vérifier le déploiement

### 3.1 Tester le backend

Ouvrez dans votre navigateur :
```
https://votre-backend.vercel.app/api/health
```

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "CRM API is running"
}
```

### 3.2 Tester le frontend

Ouvrez l'URL de votre frontend et testez :
- La connexion
- La création d'un compte
- Les fonctionnalités principales

---

## 🔧 Étape 4 : Appliquer les migrations Prisma (si nécessaire)

Si vous avez des migrations Prisma à appliquer :

### Option A : Via Prisma Studio (local)

```bash
cd server
npx prisma studio
```

Connectez-vous et synchronisez votre schéma.

### Option B : Via CLI Prisma (local)

```bash
cd server
npx prisma migrate deploy
```

---

## 🔄 Mises à jour futures

Pour mettre à jour votre application :

```bash
git add .
git commit -m "Votre message de commit"
git push
```

Vercel déploiera automatiquement les changements sur les deux projets (backend et frontend).

---

## ⚠️ Points importants

### Uploads de fichiers

**Les fichiers uploadés ne persistent pas sur Vercel** (système de fichiers éphémère).

**Solutions recommandées :**

1. **Supabase Storage** (gratuit, recommandé)
   - Intégrez Supabase Storage pour les uploads
   - Modifiez les routes d'upload pour utiliser Supabase

2. **Vercel Blob Storage**
   - Service natif Vercel
   - Payant après le plan gratuit

3. **Cloudinary**
   - Service tiers populaire
   - Plan gratuit disponible

### Variables d'environnement

- Ne commitez **jamais** vos fichiers `.env`
- Les variables d'environnement sont sécurisées sur Vercel
- Vous pouvez les modifier dans les paramètres du projet Vercel

### Base de données

- Supabase accepte automatiquement les connexions depuis Vercel
- Assurez-vous que votre `DATABASE_URL` est correct
- Vérifiez que les migrations sont appliquées

---

## 🐛 Dépannage

### Le backend ne démarre pas

1. Vérifiez les logs dans Vercel (onglet "Deployments" → cliquez sur le déploiement → "Logs")
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `DATABASE_URL` est correct

### Le frontend ne peut pas se connecter au backend

1. Vérifiez que `VITE_API_URL` pointe vers la bonne URL
2. Vérifiez que l'URL se termine par `/api`
3. Vérifiez les logs du frontend dans Vercel

### Erreurs Prisma

1. Vérifiez que `prisma generate` s'exécute dans le build
2. Vérifiez que les migrations sont appliquées
3. Vérifiez la connexion à la base de données

---

## 📞 Besoin d'aide ?

- Documentation Vercel : https://vercel.com/docs
- Documentation Prisma : https://www.prisma.io/docs
- Documentation Supabase : https://supabase.com/docs

---

## 🎉 Félicitations !

Votre CRM est maintenant déployé sur Vercel ! 🚀

