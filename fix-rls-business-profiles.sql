-- Correction des policies RLS pour business_profiles

-- Vérifier et corriger la policy INSERT
DROP POLICY IF EXISTS "Users can insert own business profiles" ON business_profiles;

CREATE POLICY "Users can insert own business profiles"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Vérifier que les autres policies existent
-- SELECT
DROP POLICY IF EXISTS "Users can view own business profiles" ON business_profiles;
CREATE POLICY "Users can view own business profiles"
ON business_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- UPDATE
DROP POLICY IF EXISTS "Users can update own business profiles" ON business_profiles;
CREATE POLICY "Users can update own business profiles"
ON business_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE
DROP POLICY IF EXISTS "Users can delete own business profiles" ON business_profiles;
CREATE POLICY "Users can delete own business profiles"
ON business_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());
