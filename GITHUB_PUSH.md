# 📤 Pousser le code sur GitHub

## Étape 1 : Vérifier les fichiers à commiter

Vérifiez que les fichiers sensibles ne sont pas inclus :
- ❌ `.env` files
- ❌ `node_modules/`
- ❌ Fichiers uploadés dans `server/uploads/`

## Étape 2 : Commiter les changements

```bash
git add .
git commit -m "feat: Ajout des fonctionnalités CRM complètes

- Dashboard opérationnel avec données réelles
- Page Analytics fonctionnelle avec filtres de période
- Gestion des biens avec upload d'images
- Classement des collaborateurs
- Configuration pour déploiement Vercel"
```

## Étape 3 : Pousser sur GitHub

```bash
git push origin main
```

## ✅ Vérification

Une fois poussé, vérifiez sur GitHub :
- https://github.com/lorenzo18012004/plateforme-immo

Tous vos fichiers doivent être visibles (sauf ceux dans .gitignore).

