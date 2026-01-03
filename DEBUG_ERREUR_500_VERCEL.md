# 🐛 Debug : Erreur 500 sur Vercel

## 🔍 Diagnostic

L'erreur 500 sur `/api/auth/verify-agency` peut avoir plusieurs causes. Voici comment les identifier :

---

## ✅ Checklist de vérification

### 1. Vérifier les variables d'environnement dans Vercel

**Projet Backend** :
1. Allez sur **Vercel Dashboard** → Votre projet backend
2. **Settings** → **Environment Variables**
3. Vérifiez que vous avez :
   - ✅ `DATABASE_URL` : URL Supabase complète
   - ✅ `JWT_SECRET` : Chaîne secrète
   - ✅ `NODE_ENV` : `production`

**Format de `DATABASE_URL`** :
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require
```

### 2. Vérifier les logs Vercel

1. **Vercel Dashboard** → Votre projet backend
2. **Deployments** → Dernier déploiement
3. **Functions** → Cliquez sur une fonction
4. **Logs** → Regardez les erreurs

**Messages à chercher** :
- `❌ Error in verify-agency:` → Erreur générale
- `Can't reach database server` → Problème de connexion
- `PrismaClient` → Prisma Client non généré
- `DATABASE_URL exists: false` → Variable d'environnement manquante

### 3. Vérifier que Prisma Client est généré

Le build Vercel doit générer Prisma Client. Vérifiez dans `server/package.json` :

```json
{
  "scripts": {
    "vercel-build": "prisma generate"
  }
}
```

### 4. Vérifier la connexion Supabase

Testez la connexion depuis votre machine locale :

```bash
cd server
set DATABASE_URL="votre-url-supabase"
npx prisma db pull
```

Si ça fonctionne en local mais pas sur Vercel, c'est un problème de configuration Vercel.

---

## 🔧 Solutions

### Solution 1 : Vérifier DATABASE_URL

1. **Allez sur Supabase Dashboard** → Votre projet
2. **Settings** → **Database**
3. **Connection string** → Copiez l'URL
4. **Vercel Dashboard** → Votre projet backend
5. **Settings** → **Environment Variables**
6. **Vérifiez/modifiez `DATABASE_URL`** avec l'URL complète

### Solution 2 : Redéployer avec Prisma

1. **Vercel Dashboard** → Votre projet backend
2. **Deployments** → Dernier déploiement
3. **3 points (⋯)** → **Redeploy**
4. Attendez que le build se termine
5. Vérifiez les logs pour voir si `prisma generate` s'exécute

### Solution 3 : Vérifier le build Vercel

Dans les logs de build, vous devriez voir :
```
Running "vercel-build" script
> prisma generate
```

Si vous ne voyez pas ça, Prisma Client n'est pas généré.

---

## 🎯 Erreurs courantes et solutions

### Erreur : "Can't reach database server"

**Cause** : `DATABASE_URL` incorrect ou base de données inaccessible

**Solution** :
1. Vérifiez `DATABASE_URL` dans Vercel
2. Vérifiez que Supabase autorise les connexions externes
3. Vérifiez que l'URL contient `?sslmode=require`

### Erreur : "PrismaClient is not configured"

**Cause** : Prisma Client n'est pas généré lors du build

**Solution** :
1. Vérifiez que `vercel-build` dans `server/package.json` contient `prisma generate`
2. Redéployez le backend
3. Vérifiez les logs de build

### Erreur : "DATABASE_URL exists: false"

**Cause** : Variable d'environnement non configurée

**Solution** :
1. Ajoutez `DATABASE_URL` dans Vercel (projet backend)
2. Redéployez

---

## 📋 Test rapide

Testez l'endpoint de santé :

```
https://votre-backend-url.vercel.app/api/health
```

Si ça fonctionne, le backend est déployé. Si `/api/auth/verify-agency` ne fonctionne pas, c'est un problème de base de données.

---

## 🔍 Debug avancé

Ajoutez ce code temporairement dans `server/src/routes/auth.ts` pour voir l'erreur exacte :

```typescript
catch (error: any) {
  console.error('Full error:', JSON.stringify(error, null, 2));
  // ... reste du code
}
```

Puis regardez les logs Vercel pour voir l'erreur complète.

---

## ✅ Après correction

1. ✅ Vérifiez `DATABASE_URL` dans Vercel
2. ✅ Redéployez le backend
3. ✅ Testez avec le code `7890`
4. ✅ Consultez les logs Vercel pour voir les nouveaux messages de debug

