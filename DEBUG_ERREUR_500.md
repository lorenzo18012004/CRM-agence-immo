# 🔧 Debug : Erreur 500 sur `/api/auth/verify-agency`

## 🔍 Diagnostic

L'erreur 500 indique que le backend ne peut pas accéder à la base de données. Voici les causes possibles :

### 1. **Variables d'environnement manquantes**

Vérifiez dans Vercel que vous avez bien configuré :

- ✅ `DATABASE_URL` : URL de connexion Supabase
- ✅ `JWT_SECRET` : Secret pour les tokens JWT
- ✅ `NODE_ENV` : `production`

### 2. **Migrations Prisma non exécutées**

Les tables n'existent peut-être pas dans votre base Supabase.

**Solution** : Exécuter les migrations Prisma sur Supabase.

---

## ✅ Solution : Exécuter les migrations Prisma

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Allez sur Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"** (menu de gauche)
4. **Créez une nouvelle requête**
5. **Exécutez cette commande** pour créer la table `Agency` :

```sql
-- Vérifier si la table Agency existe
SELECT * FROM "Agency" LIMIT 1;
```

Si vous avez une erreur "relation does not exist", vous devez exécuter les migrations Prisma.

### Option 2 : Via la ligne de commande (Local)

1. **Installez Prisma CLI** (si pas déjà fait) :
   ```bash
   npm install -g prisma
   ```

2. **Allez dans le dossier server** :
   ```bash
   cd server
   ```

3. **Configurez DATABASE_URL** :
   ```bash
   # Windows (CMD)
   set DATABASE_URL="votre-url-supabase"
   
   # Windows (PowerShell)
   $env:DATABASE_URL="votre-url-supabase"
   ```

4. **Générez Prisma Client** :
   ```bash
   npx prisma generate
   ```

5. **Exécutez les migrations** :
   ```bash
   npx prisma migrate deploy
   ```

6. **Optionnel : Seed la base de données** (créer des données de test) :
   ```bash
   npx prisma db seed
   ```

---

## 🔍 Vérification étape par étape

### Étape 1 : Vérifier DATABASE_URL dans Vercel

1. Allez sur **Vercel Dashboard** → Votre projet backend
2. **Settings** → **Environment Variables**
3. Vérifiez que `DATABASE_URL` est bien défini
4. Format attendu : `postgresql://user:password@host:port/database?sslmode=require`

### Étape 2 : Vérifier que les tables existent dans Supabase

1. Allez sur **Supabase Dashboard** → Votre projet
2. **Table Editor** (menu de gauche)
3. Vérifiez que vous voyez la table `Agency`

Si la table n'existe pas :
- Les migrations n'ont pas été exécutées
- Vous devez les exécuter (voir Option 2 ci-dessus)

### Étape 3 : Vérifier les logs Vercel

1. Allez sur **Vercel Dashboard** → Votre projet backend
2. **Deployments** → Cliquez sur le dernier déploiement
3. **Functions** → Cliquez sur une fonction
4. Regardez les **Logs** pour voir l'erreur exacte

---

## 🚀 Solution rapide : Créer une agence manuellement

Si vous voulez tester rapidement, créez une agence directement dans Supabase :

1. **Allez sur Supabase Dashboard** → Votre projet
2. **Table Editor** → `Agency`
3. **Insert row** (ou utilisez SQL Editor) :

```sql
INSERT INTO "Agency" (
  id,
  code,
  name,
  email,
  phone,
  address,
  city,
  postal_code,
  country,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '6165',
  'Mon Agence Immobilière',
  'contact@agence.com',
  '+33 1 23 45 67 89',
  '123 Rue de la République',
  'Paris',
  '75001',
  'France',
  true,
  NOW(),
  NOW()
);
```

Ensuite, testez avec le code `6165`.

---

## 📝 Code d'agence par défaut

D'après le fichier `seed.ts`, le code d'agence par défaut est : **`6165`**

---

## ⚠️ Erreurs courantes

### Erreur : "Can't reach database server"
- **Cause** : `DATABASE_URL` incorrect ou base de données inaccessible
- **Solution** : Vérifiez votre `DATABASE_URL` dans Supabase (Settings → Database → Connection string)

### Erreur : "relation 'Agency' does not exist"
- **Cause** : Les migrations Prisma n'ont pas été exécutées
- **Solution** : Exécutez `npx prisma migrate deploy` (voir Option 2)

### Erreur : "JWT_SECRET is not defined"
- **Cause** : Variable d'environnement manquante
- **Solution** : Ajoutez `JWT_SECRET` dans Vercel (n'importe quelle chaîne de caractères, ex: `mon-secret-super-securise-123`)

---

## 🎯 Checklist de vérification

- [ ] `DATABASE_URL` est configuré dans Vercel
- [ ] `JWT_SECRET` est configuré dans Vercel
- [ ] `NODE_ENV=production` est configuré dans Vercel
- [ ] Les migrations Prisma ont été exécutées sur Supabase
- [ ] La table `Agency` existe dans Supabase
- [ ] Au moins une agence existe dans la table `Agency` avec `is_active = true`
- [ ] Le code d'agence testé correspond à un code existant dans la base

---

## 🔗 Liens utiles

- **Supabase Dashboard** : https://supabase.com/dashboard
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Documentation Prisma** : https://www.prisma.io/docs

