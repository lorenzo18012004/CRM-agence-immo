# 🏢 Créer une agence dans Supabase

## 🔍 Problème

Vous voyez "Code agence invalide" car le code `7890` n'existe pas dans votre base de données Supabase.

---

## ✅ Solution : Créer une agence dans Supabase

### Option 1 : Via Supabase Dashboard (Simple)

1. **Allez sur Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Table Editor** (menu de gauche)
4. **Cliquez sur la table `Agency`**
5. **Cliquez sur "Insert row"** (ou "Insert" en haut)
6. **Remplissez les champs** :

```sql
id: (laissez vide, sera généré automatiquement)
code: 7890
name: Immobilier Premium
email: contact@premium-immo.fr
phone: +33 4 91 23 45 67
address: 67 Cours Mirabeau
city: Aix-en-Provence
postal_code: 13100
country: France
website: https://premium-immo.fr (optionnel)
is_active: true (IMPORTANT !)
created_at: (laissez vide, sera généré automatiquement)
updated_at: (laissez vide, sera généré automatiquement)
```

7. **Cliquez sur "Save"**

### Option 2 : Via SQL Editor (Rapide)

1. **Allez sur Supabase Dashboard** → Votre projet
2. **SQL Editor** (menu de gauche)
3. **New query**
4. **Copiez-collez ce SQL** :

```sql
-- Créer l'agence avec le code 7890
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
  website,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '7890',
  'Immobilier Premium',
  'contact@premium-immo.fr',
  '+33 4 91 23 45 67',
  '67 Cours Mirabeau',
  'Aix-en-Provence',
  '13100',
  'France',
  'https://premium-immo.fr',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;
```

5. **Cliquez sur "Run"** (ou Ctrl+Enter)

---

## 🎯 Codes d'agence disponibles

D'après le fichier `seed.ts`, il y a deux agences :

### Agence 1
- **Code** : `6165`
- **Nom** : Mon Agence Immobilière
- **Email** : contact@agence.com

### Agence 2
- **Code** : `7890`
- **Nom** : Immobilier Premium
- **Email** : contact@premium-immo.fr

---

## ✅ Vérification

Après avoir créé l'agence :

1. **Retournez sur votre site Vercel**
2. **Rafraîchissez la page** (F5)
3. **Entrez le code** `7890` (ou `6165`)
4. **Vous devriez pouvoir continuer** vers la page de connexion

---

## 🔍 Vérifier qu'une agence existe

Pour vérifier quelles agences existent dans votre base :

1. **Supabase Dashboard** → Votre projet
2. **Table Editor** → `Agency`
3. **Regardez la liste des agences**

Ou via SQL :

```sql
SELECT code, name, is_active FROM "Agency";
```

---

## ⚠️ Points importants

1. **`is_active` doit être `true`** : Sinon, même si le code existe, il sera rejeté
2. **Le code doit être unique** : Vous ne pouvez pas avoir deux agences avec le même code
3. **Les champs obligatoires** : `code`, `name`, `is_active`

---

## 🚀 Créer les deux agences d'un coup

Si vous voulez créer les deux agences en une fois :

```sql
-- Agence 1
INSERT INTO "Agency" (
  id, code, name, email, phone, address, city, postal_code, country, is_active, created_at, updated_at
) VALUES (
  gen_random_uuid(), '6165', 'Mon Agence Immobilière', 'contact@agence.com', 
  '+33 1 23 45 67 89', '123 Rue de la République', 'Paris', '75001', 'France', 
  true, NOW(), NOW()
)
ON CONFLICT (code) DO UPDATE SET is_active = true;

-- Agence 2
INSERT INTO "Agency" (
  id, code, name, email, phone, address, city, postal_code, country, website, is_active, created_at, updated_at
) VALUES (
  gen_random_uuid(), '7890', 'Immobilier Premium', 'contact@premium-immo.fr',
  '+33 4 91 23 45 67', '67 Cours Mirabeau', 'Aix-en-Provence', '13100', 'France',
  'https://premium-immo.fr', true, NOW(), NOW()
)
ON CONFLICT (code) DO UPDATE SET is_active = true;
```

---

## 📝 Prochaines étapes

Une fois l'agence créée :

1. ✅ Testez avec le code `7890` (ou `6165`)
2. ✅ Vous devriez voir la page de connexion
3. ✅ Connectez-vous avec un utilisateur de cette agence

**Note** : Si vous n'avez pas encore d'utilisateurs, vous devrez aussi les créer dans la table `User` avec `agency_id` correspondant.

