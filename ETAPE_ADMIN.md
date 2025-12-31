# 👤 ÉTAPE : Créer l'utilisateur Admin

## 🎯 Objectif
Créer l'utilisateur administrateur dans Supabase pour pouvoir se connecter au CRM.

---

## 📝 Instructions

### Option 1 : Via SQL Editor (Recommandé - 2 minutes)

1. **Dans Supabase** :
   - Allez dans **SQL Editor** (menu de gauche)
   - Cliquez sur **"New query"**

2. **Ouvrez le fichier** `CREER_ADMIN_FINAL.sql`

3. **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)

4. **Collez dans le SQL Editor** de Supabase (Ctrl+V)

5. **Cliquez sur "Run"** (ou Ctrl+Enter)

6. **Vérifiez** : Vous devriez voir une ligne avec l'utilisateur admin créé

---

### Option 2 : Via Table Editor (Alternative - 3 minutes)

1. **Dans Supabase** :
   - Allez dans **Table Editor** (menu de gauche)
   - Sélectionnez la table **"User"**

2. **Cliquez sur "Insert"** (bouton vert en haut)

3. **Remplissez les champs** :
   - **id** : Laissez vide (sera généré automatiquement)
   - **email** : `admin@example.com`
   - **password** : `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
   - **firstName** : `Admin`
   - **lastName** : `User`
   - **phone** : (laissez vide)
   - **role** : `ADMIN` (sélectionnez dans le dropdown)
   - **isActive** : `true` (cochez)
   - **avatar** : (laissez vide)
   - **createdAt** : (laissez vide, sera généré)
   - **updatedAt** : (laissez vide, sera généré)

4. **Cliquez sur "Save"**

---

## ✅ Vérification

Après avoir créé l'utilisateur, vérifiez dans **Table Editor** → **User** que vous voyez :
- Email : `admin@example.com`
- Role : `ADMIN`
- isActive : `true`

---

## 🔑 Identifiants de connexion

Une fois l'utilisateur créé, vous pourrez vous connecter avec :
- **Email** : `admin@example.com`
- **Mot de passe** : `admin123`

---

## ➡️ Prochaine étape

Une fois l'admin créé, dites-moi **"admin créé"** et on passera au déploiement sur Vercel !

