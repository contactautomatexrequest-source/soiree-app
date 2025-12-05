# Exécuter la migration via l'API

## 🚀 Méthode rapide : Via l'API

### Étape 1 : Exécuter la migration SQL dans Supabase (OBLIGATOIRE)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez-collez et exécutez ce SQL :

```sql
-- Ajouter la colonne incoming_alias si elle n'existe pas
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

-- Créer l'index
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;
```

### Étape 2 : Générer les alias et vérifier via l'API

Une fois la colonne créée, appelez l'API pour générer les alias et vérifier :

```bash
curl -X POST https://avisprofr.com/api/admin/fix-database \
  -H "Authorization: Bearer VOTRE_ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

Ou depuis le navigateur (si ADMIN_SECRET_KEY n'est pas configuré, la route fonctionnera quand même) :

```
https://avisprofr.com/api/admin/fix-database
```

**Note** : Pour sécuriser cette route, ajoutez `ADMIN_SECRET_KEY` dans les variables d'environnement Netlify.

## 📋 Ce que fait l'API

1. ✅ Vérifie que la colonne `incoming_alias` existe
2. ✅ Génère des alias pour tous les établissements qui n'en ont pas
3. ✅ Vérifie la synchronisation :
   - Nombre d'utilisateurs
   - Nombre d'abonnements
   - Nombre de profils établissements
   - Nombre d'avis
   - Vérifie que tous les établissements ont un `user_id`
   - Vérifie que tous les établissements ont un `incoming_alias`

## 🔒 Sécurité

Pour sécuriser cette route, ajoutez dans Netlify :
- Variable : `ADMIN_SECRET_KEY`
- Valeur : Une clé secrète (ex: `votre-cle-secrete-123`)

Ensuite, utilisez cette clé dans l'header Authorization :
```
Authorization: Bearer votre-cle-secrete-123
```

