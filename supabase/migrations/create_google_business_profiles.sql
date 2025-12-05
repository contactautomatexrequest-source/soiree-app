-- ============================================
-- TABLE GOOGLE BUSINESS PROFILES
-- Synchronisation automatique avec Google Business Profile
-- ============================================

-- Table pour stocker les profils Google Business synchronisés
CREATE TABLE IF NOT EXISTS google_business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  
  -- Identifiants Google
  google_place_id TEXT UNIQUE NOT NULL, -- ID unique Google Business Profile
  google_account_id TEXT, -- ID du compte Google Business
  
  -- Données synchronisées depuis Google
  nom_etablissement TEXT NOT NULL,
  categorie_principale TEXT,
  adresse_complete TEXT,
  ville TEXT,
  code_postal TEXT,
  pays TEXT DEFAULT 'France',
  url_fiche TEXT, -- URL de la fiche Google Business
  note_moyenne NUMERIC(3, 2), -- Note moyenne (ex: 4.5)
  nombre_avis INTEGER DEFAULT 0,
  photo_principale TEXT, -- URL de la photo principale
  
  -- Métadonnées de synchronisation
  derniere_sync_at TIMESTAMP WITH TIME ZONE,
  prochaine_sync_at TIMESTAMP WITH TIME ZONE,
  sync_en_cours BOOLEAN DEFAULT false,
  derniere_erreur TEXT, -- Message d'erreur si la dernière sync a échoué
  
  -- Tokens OAuth Google
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut avoir qu'un seul profil Google Business par établissement
  UNIQUE(user_id, google_place_id),
  UNIQUE(business_profile_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_google_business_profiles_user_id ON google_business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_google_business_profiles_business_profile_id ON google_business_profiles(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_google_business_profiles_google_place_id ON google_business_profiles(google_place_id);
CREATE INDEX IF NOT EXISTS idx_google_business_profiles_prochaine_sync ON google_business_profiles(prochaine_sync_at) WHERE prochaine_sync_at IS NOT NULL;

-- Trigger pour updated_at
CREATE TRIGGER update_google_business_profiles_updated_at
BEFORE UPDATE ON google_business_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) pour google_business_profiles
-- ============================================

ALTER TABLE google_business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy : Un utilisateur ne peut voir que ses propres profils Google
DROP POLICY IF EXISTS "Users can view own google business profiles" ON google_business_profiles;
CREATE POLICY "Users can view own google business profiles"
ON google_business_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy : Un utilisateur ne peut insérer que pour lui-même
DROP POLICY IF EXISTS "Users can insert own google business profiles" ON google_business_profiles;
CREATE POLICY "Users can insert own google business profiles"
ON google_business_profiles FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND (
    business_profile_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = google_business_profiles.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  )
);

-- Policy : Un utilisateur ne peut modifier que ses propres profils
DROP POLICY IF EXISTS "Users can update own google business profiles" ON google_business_profiles;
CREATE POLICY "Users can update own google business profiles"
ON google_business_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy : Un utilisateur ne peut supprimer que ses propres profils
DROP POLICY IF EXISTS "Users can delete own google business profiles" ON google_business_profiles;
CREATE POLICY "Users can delete own google business profiles"
ON google_business_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- MISE À JOUR DE LA TABLE REVIEWS
-- Ajouter google_review_id pour éviter les doublons
-- ============================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS google_review_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Index pour éviter les doublons
CREATE INDEX IF NOT EXISTS idx_reviews_google_review_id ON reviews(google_review_id) WHERE google_review_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_google_place_id ON reviews(google_place_id) WHERE google_place_id IS NOT NULL;

-- Contrainte unique : un avis Google ne peut être importé qu'une fois par établissement
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_google_review 
ON reviews(google_place_id, google_review_id) 
WHERE google_review_id IS NOT NULL AND google_place_id IS NOT NULL;

-- Ajouter le type 'google_sync' à l'enum source_review_type
ALTER TYPE source_review_type ADD VALUE IF NOT EXISTS 'google_sync';

