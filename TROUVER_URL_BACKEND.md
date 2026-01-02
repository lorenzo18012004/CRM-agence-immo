# 🔍 Comment trouver l'URL de votre backend Vercel

## Méthode 1 : Via le Dashboard Vercel (Recommandé)

### Étape 1 : Identifier votre projet backend

1. Allez sur **https://vercel.com/dashboard**
2. Vous verrez tous vos projets déployés
3. **Identifiez votre projet backend** :
   - Il devrait avoir un nom comme `crm-backend`, `crm-agence-immo`, ou similaire
   - C'est le projet qui contient le dossier `server/`

### Étape 2 : Trouver l'URL

1. **Cliquez sur votre projet backend**
2. En haut de la page, vous verrez l'URL de déploiement :
   - Exemple : `https://crm-backend-xyz123.vercel.app`
   - Ou : `https://crm-agence-immo-abc456.vercel.app`

3. **L'URL complète pour `VITE_API_URL` sera** :
   ```
   https://crm-backend-xyz123.vercel.app/api
   ```
   (Ajoutez `/api` à la fin)

---

## Méthode 2 : Via les Deployments

1. Allez sur votre projet backend Vercel
2. Onglet **Deployments**
3. Cliquez sur le dernier déploiement (celui avec le statut "Ready")
4. L'URL est affichée en haut de la page

---

## Méthode 3 : Si vous avez un seul projet (Monorepo)

Si vous avez déployé tout en un seul projet Vercel (monorepo) :

1. Allez sur votre projet Vercel
2. L'URL de base est votre frontend
3. L'API est accessible via : `https://votre-projet.vercel.app/api`

**Exemple** :
- Frontend : `https://crm-agence-immo.vercel.app`
- Backend API : `https://crm-agence-immo.vercel.app/api`

---

## 🎯 Comment savoir quel projet est le backend ?

### Indices pour identifier le backend :

1. **Nom du projet** :
   - Contient souvent "backend", "server", "api"
   - Ou c'est le projet avec le dossier `server/` configuré

2. **Dans les Settings** :
   - **Root Directory** : `server` ou `.`
   - **Build Command** : `npm run build` (TypeScript)
   - **Output Directory** : `dist`

3. **Dans les Deployments** :
   - Les logs montrent des routes `/api/*`
   - Les builds compilent TypeScript

---

## ✅ Vérification

Une fois que vous avez l'URL, testez-la :

1. **Test de santé** :
   ```
   https://votre-backend.vercel.app/api/health
   ```
   Vous devriez voir : `{"status":"OK","message":"CRM API is running"}`

2. **Si ça fonctionne** :
   - Utilisez cette URL + `/api` pour `VITE_API_URL`
   - Exemple : `https://crm-backend-xyz.vercel.app/api`

---

## 📝 Exemple concret

Si votre backend Vercel s'appelle `crm-backend-abc123` :

1. **URL du backend** : `https://crm-backend-abc123.vercel.app`
2. **VITE_API_URL à mettre dans le frontend** : `https://crm-backend-abc123.vercel.app/api`

---

## 🆘 Si vous ne trouvez pas

1. **Vérifiez que le backend est bien déployé** :
   - Allez sur Vercel Dashboard
   - Vérifiez qu'il y a un projet avec un déploiement réussi

2. **Vérifiez les noms de projets** :
   - Les projets Vercel peuvent avoir des noms différents de votre repo GitHub
   - Regardez dans "Settings" → "General" → "Project Name"

3. **Si vous avez un seul projet** :
   - C'est probablement un monorepo
   - L'URL sera : `https://votre-projet.vercel.app/api`

