-- ============================================
-- MIGRATION : Génération robuste et garantie d'alias
-- ============================================
-- Cette migration garantit que :
-- 1. Chaque établissement a TOUJOURS un alias unique
-- 2. L'alias ne peut jamais être NULL ou vide
-- 3. L'alias ne peut jamais être modifié après création
-- 4. Aucun doublon n'est possible

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

-- Ajouter une contrainte CHECK pour garantir que incoming_alias n'est jamais vide
ALTER TABLE business_profiles 
DROP CONSTRAINT IF EXISTS check_incoming_alias_not_empty;

ALTER TABLE business_profiles 
ADD CONSTRAINT check_incoming_alias_not_empty 
CHECK (incoming_alias IS NOT NULL AND incoming_alias != '');

-- Générer des alias pour tous les établissements existants qui n'en ont pas
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';

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
  END IF;
END $$;

