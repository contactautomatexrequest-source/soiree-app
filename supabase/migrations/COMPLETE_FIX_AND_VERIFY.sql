-- ============================================
-- MIGRATION COMPLÈTE : Fix incoming_alias + Vérifications
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Cette migration :
-- 1. Ajoute la colonne incoming_alias si elle n'existe pas
-- 2. Génère des alias pour tous les établissements existants
-- 3. Crée les index nécessaires
-- 4. Vérifie la synchronisation des données

-- ============================================
-- PARTIE 1 : Ajouter la colonne incoming_alias
-- ============================================

ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

-- ============================================
-- PARTIE 2 : Créer l'index
-- ============================================

CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

-- ============================================
-- PARTIE 3 : Générer des alias pour les établissements existants
-- ============================================

UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';

-- ============================================
-- PARTIE 4 : Vérifications et rapports
-- ============================================

-- Vérifier le nombre d'établissements avec/sans alias
DO $$
DECLARE
  total_profiles INTEGER;
  with_alias INTEGER;
  without_alias INTEGER;
  without_user_id INTEGER;
  total_users INTEGER;
  total_subscriptions INTEGER;
  total_reviews INTEGER;
BEGIN
  -- Compter les établissements
  SELECT COUNT(*) INTO total_profiles FROM business_profiles;
  SELECT COUNT(*) INTO with_alias FROM business_profiles WHERE incoming_alias IS NOT NULL;
  SELECT COUNT(*) INTO without_alias FROM business_profiles WHERE incoming_alias IS NULL;
  SELECT COUNT(*) INTO without_user_id FROM business_profiles WHERE user_id IS NULL;
  
  -- Compter les utilisateurs
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  -- Compter les abonnements
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  
  -- Compter les avis
  SELECT COUNT(*) INTO total_reviews FROM reviews;
  
  -- Afficher le rapport
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RAPPORT DE VÉRIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs: %', total_users;
  RAISE NOTICE 'Abonnements: %', total_subscriptions;
  RAISE NOTICE 'Établissements: %', total_profiles;
  RAISE NOTICE '  - Avec alias: %', with_alias;
  RAISE NOTICE '  - Sans alias: %', without_alias;
  RAISE NOTICE '  - Sans user_id: %', without_user_id;
  RAISE NOTICE 'Avis: %', total_reviews;
  RAISE NOTICE '========================================';
  
  -- Avertissements
  IF without_alias > 0 THEN
    RAISE WARNING '⚠️  % établissement(s) sans alias !', without_alias;
  END IF;
  
  IF without_user_id > 0 THEN
    RAISE WARNING '⚠️  % établissement(s) sans user_id !', without_user_id;
  END IF;
  
  IF without_alias = 0 AND without_user_id = 0 THEN
    RAISE NOTICE '✅ Tous les établissements sont correctement configurés !';
  END IF;
END $$;

-- ============================================
-- PARTIE 5 : Vérifier les doublons d'alias (ne devrait pas arriver)
-- ============================================

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
    RAISE WARNING '⚠️  % alias en doublon trouvé(s) !', duplicate_count;
  ELSE
    RAISE NOTICE '✅ Aucun doublon d''alias détecté';
  END IF;
END $$;

-- ============================================
-- PARTIE 6 : Vérifier la synchronisation user_id
-- ============================================

-- Vérifier que tous les établissements ont un user_id valide
DO $$
DECLARE
  orphan_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_profiles
  FROM business_profiles bp
  WHERE bp.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = bp.user_id
  );
  
  IF orphan_profiles > 0 THEN
    RAISE WARNING '⚠️  % établissement(s) avec user_id invalide !', orphan_profiles;
  ELSE
    RAISE NOTICE '✅ Tous les user_id sont valides';
  END IF;
END $$;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================

COMMENT ON COLUMN business_profiles.incoming_alias IS 
'Identifiant unique pour l''adresse email entrante (ex: "avis-abc12345"). Généré automatiquement.';

