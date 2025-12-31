# 🔍 Vérifier la connexion Supabase

## ❌ Problème persistant

La connexion à Supabase ne fonctionne toujours pas. Vérifions plusieurs choses.

---

## ✅ Vérifications à faire

### 1. Vérifier que le projet Supabase est actif

1. Allez sur https://app.supabase.com
2. Vérifiez que votre projet est bien listé
3. Cliquez sur votre projet
4. Vérifiez qu'il n'y a pas de message d'erreur ou de "Setting up..."

### 2. Vérifier le fichier .env

Assurez-vous que votre fichier `server/.env` contient bien :
```
DATABASE_URL="postgresql://postgres:Lololili180104%2A@db.lukldmgetpsplnlwhlff.supabase.co:5432/postgres"
```

Vérifiez :
- ✅ Le port est bien `5432` (pas `543`)
- ✅ Le `*` est bien encodé en `%2A`
- ✅ Les guillemets sont bien présents au début et à la fin
- ✅ Pas d'espaces supplémentaires

### 3. Essayer avec l'URL de Connection Pooling

Parfois, l'URL de connection pooling fonctionne mieux. Dans Supabase :

1. Settings → Database
2. Section "Connection string"
3. Onglet "Connection pooling" (pas "URI")
4. Copiez l'URL qui commence par `postgresql://`
5. Remplacez `[YOUR-PASSWORD]` par votre mot de passe encodé (`Lololili180104%2A`)

Cette URL utilise généralement le port `6543` au lieu de `5432`.

### 4. Vérifier le firewall/réseau

- Vérifiez que votre connexion internet fonctionne
- Si vous êtes sur un réseau d'entreprise, il peut y avoir un firewall qui bloque

---

## 🔄 Alternative : Utiliser Prisma Studio pour tester

On peut essayer de tester la connexion avec Prisma Studio :

```bash
cd server
npx prisma studio
```

Si Prisma Studio arrive à se connecter, alors le problème vient peut-être des migrations.

---

## ➡️ Prochaines étapes

Dites-moi :
1. Votre projet Supabase est-il bien actif dans le dashboard ?
2. Pouvez-vous me montrer votre ligne DATABASE_URL (en remplaçant le mot de passe par XXXXX) ?
3. Voulez-vous qu'on essaie avec l'URL de connection pooling ?

