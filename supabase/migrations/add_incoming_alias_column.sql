-- ============================================
-- MIGRATION : Ajouter la colonne incoming_alias si elle n'existe pas
-- ============================================
-- Cette migration ajoute la colonne incoming_alias à la table business_profiles
-- si elle n'existe pas déjà

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

-- Commentaire pour documentation
COMMENT ON COLUMN business_profiles.incoming_alias IS 'Identifiant unique pour l''adresse email entrante (ex: "avis-abc12345")';

