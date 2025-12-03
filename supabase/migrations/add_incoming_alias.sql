-- ============================================
-- MIGRATION : Renommage email_alias -> incoming_alias
-- Sécurisation multi-clients
-- ============================================

-- Renommer la colonne email_alias en incoming_alias
ALTER TABLE business_profiles 
  RENAME COLUMN email_alias TO incoming_alias;

-- L'index existant sera automatiquement renommé
-- Mais on s'assure qu'il existe bien
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
  ON business_profiles(incoming_alias) 
  WHERE incoming_alias IS NOT NULL;

-- Supprimer l'ancien index s'il existe encore
DROP INDEX IF EXISTS idx_business_profiles_email_alias;

-- ============================================
-- RENFORCEMENT DES RLS POUR SÉCURISATION MULTI-CLIENTS
-- ============================================

-- Vérifier que RLS est bien activé
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies pour reviews et les recréer avec une vérification plus stricte
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
CREATE POLICY "Users can view own reviews"
ON reviews FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM business_profiles
    WHERE business_profiles.id = reviews.business_id
    AND business_profiles.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
CREATE POLICY "Users can insert own reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM business_profiles
    WHERE business_profiles.id = reviews.business_id
    AND business_profiles.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM business_profiles
    WHERE business_profiles.id = reviews.business_id
    AND business_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM business_profiles
    WHERE business_profiles.id = reviews.business_id
    AND business_profiles.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM business_profiles
    WHERE business_profiles.id = reviews.business_id
    AND business_profiles.user_id = auth.uid()
  )
);

-- S'assurer que les policies pour business_profiles sont correctes
DROP POLICY IF EXISTS "Users can view own business profiles" ON business_profiles;
CREATE POLICY "Users can view own business profiles"
ON business_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own business profiles" ON business_profiles;
CREATE POLICY "Users can insert own business profiles"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own business profiles" ON business_profiles;
CREATE POLICY "Users can update own business profiles"
ON business_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own business profiles" ON business_profiles;
CREATE POLICY "Users can delete own business profiles"
ON business_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

