# 🔍 Vérifier pourquoi l'agence n'est pas trouvée

## ✅ Checklist de vérification

### 1. Vérifier que `is_active` est à `true`

1. **Allez sur Supabase Dashboard** → Votre projet
2. **Table Editor** → `Agency`
3. **Trouvez l'agence avec le code `7890`**
4. **Vérifiez la colonne `is_active`** :
   - ✅ Doit être **`true`** (coché)
   - ❌ Si c'est `false`, changez-le en `true`

### 2. Vérifier le code exact

1. **Dans la table `Agency`**, regardez la colonne `code`
2. **Vérifiez qu'il n'y a pas d'espaces** :
   - ✅ Bon : `7890`
   - ❌ Mauvais : ` 7890 ` ou `7890 ` ou ` 7890`
3. **Si il y a des espaces**, modifiez la ligne et supprimez-les

### 3. Vérifier via SQL

Exécutez cette requête dans **SQL Editor** :

```sql
-- Voir toutes les agences avec leur statut
SELECT 
  code, 
  name, 
  is_active,
  LENGTH(code) as code_length,
  code = '7890' as exact_match
FROM "Agency";
```

**Résultat attendu** :
- `code` : `7890`
- `is_active` : `true`
- `code_length` : `4`
- `exact_match` : `true`

### 4. Tester la requête exacte

```sql
-- Tester la requête que fait Prisma
SELECT 
  id,
  code,
  name,
  logo,
  is_active
FROM "Agency"
WHERE code = '7890';
```

**Si aucun résultat** :
- Le code n'existe pas ou est différent
- Vérifiez s'il y a des espaces ou des caractères invisibles

**Si un résultat mais `is_active = false`** :
- Changez `is_active` à `true`

---

## 🔧 Solution rapide : Forcer `is_active = true`

Si l'agence existe mais `is_active` est à `false` :

```sql
UPDATE "Agency"
SET is_active = true
WHERE code = '7890';
```

---

## 📋 Vérifier tous les codes d'agence

Pour voir tous les codes disponibles :

```sql
SELECT code, name, is_active 
FROM "Agency" 
ORDER BY code;
```

---

## 🐛 Debug : Voir les logs Vercel

Après avoir redéployé avec les nouveaux logs :

1. **Allez sur Vercel Dashboard** → Votre projet backend
2. **Deployments** → Dernier déploiement
3. **Functions** → Cliquez sur une fonction
4. **Logs** → Regardez les messages :
   - `🔍 Verifying agency code: 7890`
   - `📋 Agency found: ...` ou `null`
   - `📋 All agencies in DB: ...`

Ces logs vous diront exactement ce qui se passe.

---

## ✅ Après correction

1. **Modifiez `is_active` à `true`** si nécessaire
2. **Vérifiez qu'il n'y a pas d'espaces** dans le code
3. **Redéployez le backend** sur Vercel (si vous avez fait des changements)
4. **Testez à nouveau** avec le code `7890`

---

## 🎯 Problèmes courants

### Problème 1 : `is_active = false`
**Solution** : Changez à `true` dans Supabase

### Problème 2 : Espaces dans le code
**Solution** : Supprimez les espaces dans Supabase

### Problème 3 : Code différent
**Solution** : Vérifiez le code exact dans Supabase et utilisez-le

### Problème 4 : Base de données différente
**Solution** : Vérifiez que `DATABASE_URL` dans Vercel pointe vers la bonne base Supabase

