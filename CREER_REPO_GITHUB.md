# 📦 Créer et pousser sur GitHub

## Option 1 : Créer le repository via l'interface GitHub (Recommandé)

### Étape 1 : Créer le repository sur GitHub

1. Allez sur **https://github.com/new**
2. Remplissez les informations :
   - **Repository name** : `plateforme-immo` (ou le nom que vous voulez)
   - **Description** : `CRM complet pour agence immobilière`
   - **Visibility** : Public ou Private (votre choix)
   - **⚠️ NE COCHEZ PAS** "Initialize this repository with a README" (vous avez déjà du code)
3. Cliquez sur **"Create repository"**

### Étape 2 : Connecter votre code local

Une fois le repository créé, GitHub vous donnera des commandes. Utilisez celles-ci :

```bash
# Si le remote existe déjà mais pointe vers un mauvais endroit
git remote set-url origin https://github.com/lorenzo18012004/plateforme-immo.git

# Ou si vous devez ajouter le remote
git remote add origin https://github.com/lorenzo18012004/plateforme-immo.git

# Puis poussez votre code
git push -u origin main
```

---

## Option 2 : Utiliser GitHub CLI (si installé)

```bash
gh repo create plateforme-immo --public --source=. --remote=origin --push
```

---

## Option 3 : Créer un nouveau repository avec un autre nom

Si vous voulez un nom différent :

1. Créez le repository sur GitHub avec le nom de votre choix
2. Mettez à jour le remote :

```bash
git remote set-url origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git push -u origin main
```

---

## ✅ Vérification

Une fois poussé, vérifiez sur GitHub :
- https://github.com/lorenzo18012004/plateforme-immo

Tous vos fichiers doivent être visibles (sauf ceux dans .gitignore).

---

## 🔐 Important : Vérifier que les fichiers sensibles ne sont pas commités

Avant de pousser, vérifiez que ces fichiers ne sont PAS dans le repository :

```bash
# Vérifier qu'aucun .env n'est tracké
git ls-files | grep .env

# Si vous voyez des .env, supprimez-les :
git rm --cached server/.env
git rm --cached client/.env
git commit -m "Remove .env files"
```

Les fichiers `.env` doivent être dans `.gitignore` (c'est déjà le cas ✅).

