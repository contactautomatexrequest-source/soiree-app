# Instructions pour exécuter le SQL dans Supabase

## 📋 Fichier SQL à exécuter

Le fichier SQL complet se trouve dans : `supabase/migrations/EXECUTE_ALL_MIGRATIONS.sql`

## 🚀 Étapes pour exécuter

1. **Ouvrez le dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Connectez-vous à votre compte
   - Sélectionnez votre projet AvisPro

2. **Ouvrez le SQL Editor**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query" (ou utilisez le raccourci `Cmd/Ctrl + N`)

3. **Copiez le SQL**
   - Ouvrez le fichier `supabase/migrations/EXECUTE_ALL_MIGRATIONS.sql`
   - Copiez tout le contenu (Cmd/Ctrl + A puis Cmd/Ctrl + C)

4. **Collez et exécutez**
   - Collez le SQL dans l'éditeur Supabase (Cmd/Ctrl + V)
   - Cliquez sur "Run" (ou appuyez sur `Cmd/Ctrl + Enter`)

5. **Vérifiez le résultat**
   - Vous devriez voir des messages de succès dans la console
   - Vérifiez qu'il n'y a pas d'erreurs en rouge

## ✅ Ce que fait cette migration

1. **Génération automatique d'alias** : Crée un trigger qui génère automatiquement un alias unique pour chaque nouvel établissement
2. **Protection contre modification** : Empêche toute modification de l'alias après création
3. **Contrainte CHECK** : Garantit que l'alias n'est jamais NULL ou vide
4. **Mise à jour des établissements existants** : Génère des alias pour tous les établissements qui n'en ont pas encore
5. **Table de logs** : Crée une table pour tracer les emails rejetés
6. **Vérification d'unicité** : Vérifie qu'il n'y a pas de doublons

## 📝 SQL à exécuter

Voici le SQL complet (également disponible dans `supabase/migrations/EXECUTE_ALL_MIGRATIONS.sql`) :

```sql
-- ============================================
-- MIGRATION COMPLÈTE : Système d'alias emails robuste
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Cette migration garantit :
-- 1. Génération automatique et robuste d'alias
-- 2. Immutabilité des alias
-- 3. Table de logs pour les emails rejetés
-- 4. Vérifications d'unicité

-- ============================================
-- PARTIE 1 : Génération robuste d'alias
-- ============================================

-- Améliorer la fonction de génération pour garantir l'unicité
CREATE OR REPLACE FUNCTION generate_incoming_alias()
RETURNS TRIGGER AS $$
DECLARE
  alias_candidate TEXT;
  counter INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  -- Si incoming_alias est déjà défini et non vide, le conserver (pas de regénération)
  IF NEW.incoming_alias IS NOT NULL AND NEW.incoming_alias != '' THEN
    RETURN NEW;
  END IF;

  -- Générer un alias unique avec retry en cas de collision
  LOOP
    -- Utiliser les 8 premiers caractères de l'UUID (sans tirets) + un suffixe si nécessaire
    IF counter = 0 THEN
      alias_candidate := 'avis-' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8);
    ELSE
      -- En cas de collision, ajouter un suffixe numérique
      alias_candidate := 'avis-' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 6) || counter::text;
    END IF;

    -- Vérifier l'unicité
    IF NOT EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE incoming_alias = alias_candidate 
      AND id != NEW.id
    ) THEN
      NEW.incoming_alias := alias_candidate;
      EXIT;
    END IF;

    counter := counter + 1;
    IF counter >= max_attempts THEN
      -- En dernier recours, utiliser l'UUID complet (garantit l'unicité)
      NEW.incoming_alias := 'avis-' || REPLACE(NEW.id::text, '-', '');
      EXIT;
    END IF;
  END LOOP;

  -- Garantir que l'alias n'est jamais NULL
  IF NEW.incoming_alias IS NULL OR NEW.incoming_alias = '' THEN
    RAISE EXCEPTION 'Failed to generate incoming_alias for business profile %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS auto_generate_incoming_alias ON business_profiles;

-- Créer le trigger BEFORE INSERT (génération à la création)
CREATE TRIGGER auto_generate_incoming_alias
BEFORE INSERT ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION generate_incoming_alias();

-- ============================================
-- PARTIE 2 : Empêcher la modification d'alias
-- ============================================

-- Créer un trigger BEFORE UPDATE pour EMPÊCHER la modification de l'alias
CREATE OR REPLACE FUNCTION prevent_alias_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'alias est modifié, le restaurer à l'ancienne valeur
  IF OLD.incoming_alias IS NOT NULL AND OLD.incoming_alias != '' THEN
    IF NEW.incoming_alias != OLD.incoming_alias THEN
      NEW.incoming_alias := OLD.incoming_alias;
      RAISE WARNING 'Attempted to modify incoming_alias for business profile %. Alias is immutable.', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_alias_modification_trigger ON business_profiles;

CREATE TRIGGER prevent_alias_modification_trigger
BEFORE UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_alias_modification();

-- ============================================
-- PARTIE 3 : Contrainte CHECK pour garantir non-null
-- ============================================

-- Ajouter une contrainte CHECK pour garantir que incoming_alias n'est jamais vide
ALTER TABLE business_profiles 
DROP CONSTRAINT IF EXISTS check_incoming_alias_not_empty;

ALTER TABLE business_profiles 
ADD CONSTRAINT check_incoming_alias_not_empty 
CHECK (incoming_alias IS NOT NULL AND incoming_alias != '');

-- ============================================
-- PARTIE 4 : Générer des alias pour les établissements existants
-- ============================================

-- Générer des alias pour tous les établissements existants qui n'en ont pas
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';

-- ============================================
-- PARTIE 5 : Vérification d'unicité
-- ============================================

-- Vérifier qu'il n'y a pas de doublons (devrait être impossible avec UNIQUE, mais on vérifie)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT incoming_alias, COUNT(*) as cnt
    FROM business_profiles
    WHERE incoming_alias IS NOT NULL
    GROUP BY incoming_alias
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate incoming_alias values. This should not happen.', duplicate_count;
  ELSE
    RAISE NOTICE 'No duplicate aliases found. System is healthy.';
  END IF;
END $$;

-- ============================================
-- PARTIE 6 : Table de logs pour emails rejetés
-- ============================================

-- Créer la table de logs des emails rejetés
CREATE TABLE IF NOT EXISTS email_rejection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_to TEXT NOT NULL,
  alias_extracted TEXT,
  reason TEXT NOT NULL, -- 'no_establishment_found', 'invalid_format', etc.
  message_id TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_subject TEXT,
  email_from TEXT
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_received_at ON email_rejection_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_alias ON email_rejection_logs(alias_extracted) WHERE alias_extracted IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_reason ON email_rejection_logs(reason);

-- RLS : Seuls les admins peuvent voir ces logs
ALTER TABLE email_rejection_logs ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs authentifiés peuvent voir leurs propres logs (à adapter selon votre système)
-- Pour l'instant, on permet la lecture à tous les authentifiés (à restreindre si nécessaire)
DROP POLICY IF EXISTS "Authenticated users can view rejection logs" ON email_rejection_logs;
CREATE POLICY "Authenticated users can view rejection logs"
ON email_rejection_logs FOR SELECT
TO authenticated
USING (true); -- À adapter selon vos besoins de sécurité

-- ============================================
-- RÉSUMÉ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration terminée avec succès !';
  RAISE NOTICE '✅ Trigger de génération d''alias créé';
  RAISE NOTICE '✅ Trigger de protection contre modification créé';
  RAISE NOTICE '✅ Contrainte CHECK ajoutée';
  RAISE NOTICE '✅ Table email_rejection_logs créée';
  RAISE NOTICE '✅ Tous les établissements existants ont maintenant un alias';
END $$;
```

## ✅ Après l'exécution

Une fois le SQL exécuté avec succès :

1. **Vérifiez les triggers** : Allez dans "Database" > "Triggers" et vérifiez que les triggers `auto_generate_incoming_alias` et `prevent_alias_modification_trigger` existent

2. **Vérifiez les établissements** : Exécutez cette requête pour vérifier que tous les établissements ont un alias :
   ```sql
   SELECT id, nom_etablissement, incoming_alias 
   FROM business_profiles 
   WHERE incoming_alias IS NULL OR incoming_alias = '';
   ```
   Cette requête ne doit retourner aucune ligne.

3. **Testez la création** : Créez un nouvel établissement depuis l'interface et vérifiez qu'un alias est automatiquement généré.

## 🎯 Résultat attendu

Après l'exécution, vous devriez voir dans la console Supabase :
- ✅ Migration terminée avec succès !
- ✅ Trigger de génération d'alias créé
- ✅ Trigger de protection contre modification créé
- ✅ Contrainte CHECK ajoutée
- ✅ Table email_rejection_logs créée
- ✅ Tous les établissements existants ont maintenant un alias
- ✅ No duplicate aliases found. System is healthy.

