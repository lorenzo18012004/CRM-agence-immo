# 🔧 Résoudre l'erreur de connexion

## ❌ Erreur rencontrée

```
Can't reach database server at `db.lukldmgetpsplnlwhlff.supabase.co:5432`
```

Cela signifie que Prisma ne peut pas se connecter à Supabase.

---

## 🔍 Causes possibles

### 1. Le mot de passe n'a pas été remplacé
Le fichier `.env` contient encore `[YOUR-PASSWORD]` au lieu de votre vrai mot de passe.

### 2. Le mot de passe contient des caractères spéciaux
Si votre mot de passe contient des caractères comme `@`, `#`, `!`, `%`, etc., ils doivent être encodés en URL.

### 3. Problème de réseau/firewall
Votre connexion internet ou un firewall bloque l'accès.

---

## ✅ Solutions

### Solution 1 : Vérifier le fichier .env

1. Ouvrez `server/.env`
2. Vérifiez que la ligne `DATABASE_URL` contient bien votre mot de passe (pas `[YOUR-PASSWORD]`)
3. L'URL doit ressembler à :
   ```
   DATABASE_URL="postgresql://postgres:VOTRE_VRAI_MOT_DE_PASSE@db.lukldmgetpsplnlwhlff.supabase.co:5432/postgres"
   ```

### Solution 2 : Encoder les caractères spéciaux

Si votre mot de passe contient des caractères spéciaux, vous devez les encoder :

| Caractère | Encodage |
|-----------|----------|
| `@` | `%40` |
| `#` | `%23` |
| `!` | `%21` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| ` ` (espace) | `%20` |

**Exemple :**
- Mot de passe : `Mon@Mot#De!Passe`
- Encodé : `Mon%40Mot%23De%21Passe`
- URL complète : `postgresql://postgres:Mon%40Mot%23De%21Passe@db.lukldmgetpsplnlwhlff.supabase.co:5432/postgres`

### Solution 3 : Vérifier la connexion Supabase

1. Allez sur https://app.supabase.com
2. Vérifiez que votre projet est bien actif
3. Vérifiez que vous pouvez accéder au dashboard

---

## 🛠️ Outil pour encoder l'URL

Vous pouvez utiliser un encodeur d'URL en ligne :
- https://www.urlencoder.org/
- Encodez seulement la partie mot de passe (pas toute l'URL)

---

## ➡️ Prochaines étapes

1. Vérifiez votre fichier `.env`
2. Si le mot de passe contient des caractères spéciaux, encodez-les
3. Sauvegardez le fichier
4. Réessayez la commande

