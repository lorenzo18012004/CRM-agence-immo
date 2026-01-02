# 🚀 Déploiement Rapide sur Vercel

## Guide étape par étape (5 minutes)

### 1️⃣ Préparer votre base de données

**Option recommandée : Supabase (gratuit)**

1. Allez sur https://supabase.com et créez un compte
2. Créez un nouveau projet
3. Dans "Settings" > "Database", copiez votre "Connection string" (URI)
4. Dans "SQL Editor", créez votre base de données en exécutant votre schéma Prisma

### 2️⃣ Déployer le Backend

#### Via l'interface Vercel :

1. **Allez sur** https://vercel.com/new
2. **Connectez votre repository** GitHub/GitLab
3. **Configurez le projet** :
   - **Root Directory** : `server`
   - **Framework Preset** : Other
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. **Ajoutez les variables d'environnement** :
   ```
   DATABASE_URL = votre-url-postgresql-de-supabase
   JWT_SECRET = générez-un-secret-avec-openssl-rand-base64-32
   NODE_ENV = production
   ```

5. **Cliquez sur "Deploy"**

6. **Notez l'URL** de votre backend (ex: `https://crm-backend-xyz.vercel.app`)

#### Via CLI (optionnel) :

```bash
cd server
npm i -g vercel
vercel
# Suivez les instructions
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### 3️⃣ Déployer le Frontend

#### Via l'interface Vercel :

1. **Allez sur** https://vercel.com/new
2. **Importez le même repository**
3. **Configurez le projet** :
   - **Root Directory** : `client`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. **Ajoutez la variable d'environnement** :
   ```
   VITE_API_URL = https://votre-backend.vercel.app/api
   ```
   (Remplacez par l'URL de votre backend déployé à l'étape 2)

5. **Cliquez sur "Deploy"**

#### Via CLI (optionnel) :

```bash
cd client
vercel
# Suivez les instructions
vercel env add VITE_API_URL
```

### 4️⃣ Appliquer les migrations Prisma

Après le déploiement du backend, vous devez appliquer les migrations :

**Option A : Via Prisma Studio (local)**
```bash
cd server
npx prisma studio
# Connectez-vous et synchronisez votre schéma
```

**Option B : Via CLI Prisma**
```bash
cd server
npx prisma migrate deploy
```

### 5️⃣ Tester

1. Ouvrez l'URL de votre frontend déployé
2. Testez la connexion
3. Vérifiez que l'API répond : `https://votre-backend.vercel.app/api/health`

## ⚠️ Points importants

1. **Uploads de fichiers** : Les fichiers uploadés ne persistent pas sur Vercel. Vous devrez utiliser :
   - Vercel Blob Storage
   - AWS S3
   - Cloudinary
   - Supabase Storage

2. **Base de données** : Assurez-vous que votre base de données accepte les connexions depuis Vercel (Supabase le fait automatiquement)

3. **Variables d'environnement** : Ne commitez jamais vos `.env` files

## 🔄 Mises à jour

Pour mettre à jour votre application :
```bash
git add .
git commit -m "Votre message"
git push
```
Vercel déploiera automatiquement !

## 📞 Besoin d'aide ?

Consultez le fichier `DEPLOY.md` pour plus de détails.

