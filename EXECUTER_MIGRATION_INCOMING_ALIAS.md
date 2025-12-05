# Migration : Ajouter la colonne incoming_alias

## 🚨 Problème

Erreur : `column business_profiles.incoming_alias does not exist`

## ✅ Solution

Exécutez cette migration SQL dans Supabase :

### Étape 1 : Ouvrir SQL Editor dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**

### Étape 2 : Exécuter la migration

Copiez-collez ce SQL et exécutez-le :

```sql
-- Ajouter la colonne incoming_alias si elle n'existe pas
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

-- Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

-- Générer des alias pour les établissements existants qui n'en ont pas
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';
```

### Étape 3 : Vérifier

Vérifiez que la colonne existe :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name = 'incoming_alias';
```

Vous devriez voir :
```
column_name      | data_type
-----------------|----------
incoming_alias   | text
```

## 📝 Fichier de migration

Le fichier complet est disponible dans :
- `supabase/migrations/add_incoming_alias_column.sql`

## ⚠️ Important

Cette migration est **idempotente** (peut être exécutée plusieurs fois sans problème) grâce à `IF NOT EXISTS`.

