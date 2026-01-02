# 🚀 Déploiement Monorepo sur Vercel (Un seul projet)

Avec votre structure monorepo, vous pouvez déployer **tout en un seul projet Vercel** !

## ✅ Avantages

- **Un seul projet** à gérer
- **Une seule URL** pour tout
- **Variables d'environnement** centralisées
- **Déploiements synchronisés**

## 📋 Configuration

Le fichier `vercel.json` à la racine est déjà configuré pour :
- Router `/api/*` vers le backend (serverless functions)
- Router tout le reste vers le frontend (site statique)

## 🎯 Étapes de déploiement

### 1. Créer le projet sur Vercel

1. Allez sur **https://vercel.com/new**
2. Importez votre repository `CRM-agence-immo`
3. **Configurez le projet** :
   ```
   Framework Preset: Other
   Root Directory: . (racine, laissez vide ou mettez un point)
   Build Command: (laissez vide, Vercel détectera automatiquement)
   Output Directory: (laissez vide)
   Install Command: (laissez vide)
   ```

### 2. Ajouter les variables d'environnement

Dans la section **"Environment Variables"**, ajoutez :

| Variable | Valeur | Où l'utiliser |
|----------|--------|---------------|
| `DATABASE_URL` | Votre URL Supabase | Production, Preview, Development |
| `JWT_SECRET` | Secret aléatoire | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `VITE_API_URL` | `/api` (ou l'URL complète en production) | Production, Preview, Development |

**Note importante pour `VITE_API_URL` :**
- En production sur Vercel, utilisez `/api` (chemin relatif)
- Ou utilisez l'URL complète de votre déploiement : `https://votre-projet.vercel.app/api`

### 3. Configurer les builds

Vercel détectera automatiquement :
- Le backend dans `server/` (via `vercel.json`)
- Le frontend dans `client/` (via `vercel.json`)

### 4. Déployer

Cliquez sur **"Deploy"** et attendez !

## 🔧 Structure du déploiement

Une fois déployé :
- **Frontend** : `https://votre-projet.vercel.app/`
- **Backend API** : `https://votre-projet.vercel.app/api/*`

Tout fonctionne sur la même URL ! 🎉

## ⚙️ Configuration avancée

Si vous avez besoin de personnaliser les builds, vous pouvez ajouter dans `vercel.json` :

```json
{
  "buildCommand": "cd client && npm run build",
  "installCommand": "npm install && cd server && npm install && cd ../client && npm install"
}
```

Mais normalement, Vercel détecte automatiquement grâce à `vercel.json`.

## ✅ Vérification

Après le déploiement :

1. **Testez le backend** : `https://votre-projet.vercel.app/api/health`
2. **Testez le frontend** : `https://votre-projet.vercel.app/`
3. **Vérifiez les logs** dans Vercel si quelque chose ne fonctionne pas

## 🔄 Mises à jour

Pour mettre à jour :

```bash
git add .
git commit -m "Votre message"
git push
```

Vercel déploiera automatiquement !

## ⚠️ Points importants

1. **Uploads de fichiers** : Utilisez Supabase Storage ou un service externe
2. **Variables d'environnement** : `VITE_API_URL` doit pointer vers `/api` en production
3. **Base de données** : Assurez-vous que Supabase accepte les connexions depuis Vercel

