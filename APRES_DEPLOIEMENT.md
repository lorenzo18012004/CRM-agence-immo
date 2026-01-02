# 🎉 Après le déploiement - Guide des prochaines étapes

Félicitations ! Votre CRM est maintenant déployé sur Vercel. Voici ce que vous devez faire maintenant.

## ✅ Étape 1 : Tester votre application

### 1.1 Vérifier que tout fonctionne

1. **Ouvrez l'URL de votre frontend** (ex: `https://crm-agence-immo.vercel.app`)
2. **Testez la connexion** :
   - Créez un compte ou connectez-vous
   - Vérifiez que vous pouvez accéder au dashboard

### 1.2 Vérifier le backend

1. **Testez l'endpoint de santé** :
   ```
   https://votre-backend.vercel.app/api/health
   ```
   Vous devriez voir : `{"status":"OK","message":"CRM API is running"}`

2. **Vérifiez les logs Vercel** :
   - Allez dans votre projet Vercel
   - Onglet "Deployments" → Cliquez sur le dernier déploiement
   - Vérifiez qu'il n'y a pas d'erreurs dans les logs

## 🔧 Étape 2 : Configurer les variables d'environnement

### 2.1 Vérifier les variables du Backend

Dans votre projet backend sur Vercel :
- **Settings** → **Environment Variables**
- Vérifiez que vous avez :
  - `DATABASE_URL` = votre URL Supabase
  - `JWT_SECRET` = un secret fort
  - `NODE_ENV` = `production`

### 2.2 Vérifier les variables du Frontend

Dans votre projet frontend sur Vercel :
- **Settings** → **Environment Variables**
- Vérifiez que vous avez :
  - `VITE_API_URL` = `https://votre-backend.vercel.app/api`

**⚠️ Important** : Si vous avez modifié les variables, vous devez **redéployer** :
- Allez dans **Deployments**
- Cliquez sur les 3 points (⋯) du dernier déploiement
- **Redeploy**

## 🗄️ Étape 3 : Appliquer les migrations Prisma

Votre base de données Supabase doit avoir le bon schéma. Si ce n'est pas déjà fait :

### Option A : Via Prisma Studio (local)

```bash
cd server
npx prisma studio
```

1. Connectez-vous avec votre `DATABASE_URL`
2. Vérifiez que toutes les tables existent
3. Si des tables manquent, exécutez vos migrations SQL dans Supabase

### Option B : Via Supabase SQL Editor

1. Allez sur votre projet Supabase
2. **SQL Editor** → **New Query**
3. Exécutez vos fichiers de migration SQL :
   - `server/migration.sql`
   - `server/migration_multi_tenant.sql`
   - etc.

## 📸 Étape 4 : Configurer le stockage des images

**⚠️ IMPORTANT** : Vercel ne conserve pas les fichiers uploadés (système de fichiers éphémère).

### Solution recommandée : Supabase Storage

1. **Activez Supabase Storage** :
   - Allez sur votre projet Supabase
   - **Storage** → Créez un bucket `property-photos`
   - Configurez les permissions (public read, authenticated write)

2. **Modifiez le code d'upload** :
   - Remplacez l'upload local par Supabase Storage
   - Utilisez le SDK Supabase pour uploader les images

### Alternative : Vercel Blob Storage

1. Installez `@vercel/blob`
2. Configurez l'upload vers Vercel Blob
3. Modifiez les routes d'upload

## 🧪 Étape 5 : Tester les fonctionnalités principales

Testez chaque section de votre CRM :

- [ ] **Dashboard** : Vérifiez que les données s'affichent
- [ ] **Biens** : Créez un bien, ajoutez des photos
- [ ] **Clients** : Créez un client
- [ ] **Analytics** : Vérifiez les graphiques et statistiques
- [ ] **Tâches** : Créez une tâche
- [ ] **Rendez-vous** : Créez un rendez-vous
- [ ] **Contrats** : Créez un contrat
- [ ] **Mandats** : Créez un mandat

## 🌐 Étape 6 : Configurer un domaine personnalisé (optionnel)

Si vous voulez un domaine personnalisé :

1. **Dans Vercel** :
   - **Settings** → **Domains**
   - Ajoutez votre domaine (ex: `crm.mondomaine.com`)
   - Suivez les instructions pour configurer le DNS

2. **Mettez à jour `VITE_API_URL`** :
   - Utilisez votre nouveau domaine pour l'API

## 🔐 Étape 7 : Sécurité

### 7.1 Vérifier la sécurité

- [ ] Les variables d'environnement sont bien configurées
- [ ] Le `JWT_SECRET` est fort et unique
- [ ] La base de données Supabase est sécurisée
- [ ] Les uploads sont sécurisés (si configurés)

### 7.2 Créer un utilisateur admin

1. Connectez-vous à votre application
2. Créez un compte
3. Dans Supabase, modifiez manuellement le rôle en `SUPER_ADMIN` ou `ADMIN` dans la table `User`

## 📊 Étape 8 : Monitoring et logs

### 8.1 Surveiller les erreurs

- **Vercel Dashboard** → **Deployments** → Vérifiez les logs
- **Supabase Dashboard** → **Logs** → Vérifiez les requêtes

### 8.2 Analytics (optionnel)

- Configurez Google Analytics ou Vercel Analytics
- Surveillez les performances

## 🔄 Étape 9 : Mises à jour futures

Pour mettre à jour votre application :

```bash
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push
```

Vercel déploiera automatiquement les changements ! 🚀

## 📝 Checklist finale

- [ ] Application accessible et fonctionnelle
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Uploads de fichiers configurés (Supabase Storage)
- [ ] Toutes les fonctionnalités testées
- [ ] Utilisateur admin créé
- [ ] Domaine personnalisé configuré (optionnel)

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Vercel** : Onglet "Deployments" → Logs
2. **Vérifiez les logs Supabase** : Dashboard → Logs
3. **Vérifiez la console du navigateur** : F12 → Console
4. **Testez l'API directement** : Utilisez Postman ou curl

## 🎊 Félicitations !

Votre CRM est maintenant en production ! Vous pouvez commencer à l'utiliser pour gérer votre agence immobilière.

