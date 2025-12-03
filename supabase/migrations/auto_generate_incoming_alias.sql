-- ============================================
-- TRIGGER : Génération automatique de incoming_alias
-- ============================================
-- Ce trigger génère automatiquement un alias unique du type "avis-{id}"
-- pour chaque nouvel établissement créé

CREATE OR REPLACE FUNCTION generate_incoming_alias()
RETURNS TRIGGER AS $$
BEGIN
  -- Si incoming_alias n'est pas déjà défini, le générer automatiquement
  IF NEW.incoming_alias IS NULL OR NEW.incoming_alias = '' THEN
    -- Utiliser les 8 premiers caractères de l'UUID (sans tirets) pour un identifiant court
    NEW.incoming_alias := 'avis-' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS auto_generate_incoming_alias ON business_profiles;

-- Créer le trigger qui s'exécute avant l'insertion
CREATE TRIGGER auto_generate_incoming_alias
BEFORE INSERT ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION generate_incoming_alias();

-- ============================================
-- MISE À JOUR DES ÉTABLISSEMENTS EXISTANTS SANS ALIAS
-- ============================================
-- Générer des alias pour les établissements qui n'en ont pas encore

UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';

