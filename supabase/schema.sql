-- ============================================
-- SCHÉMA SUPABASE POUR "AVISPRO"
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum pour les métiers
CREATE TYPE metier_type AS ENUM ('restaurant', 'coiffeur', 'garage', 'photographe', 'coach');

-- Enum pour le ton de marque
CREATE TYPE ton_marque_type AS ENUM ('neutre', 'chaleureux', 'premium', 'commercial');

-- Enum pour la source des avis
CREATE TYPE source_review_type AS ENUM ('manuel', 'gmail', 'email_auto');

-- Enum pour les plans
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'business', 'agence');

-- Table business_profiles (profils établissements)
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metier metier_type NOT NULL,
  nom_etablissement TEXT NOT NULL,
  ville TEXT NOT NULL,
  ton_marque ton_marque_type NOT NULL DEFAULT 'chaleureux',
  incoming_alias TEXT UNIQUE, -- Identifiant unique pour l'adresse email entrante (ex: "abc123")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nom_etablissement, ville)
);

-- Table reviews (avis Google)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  source source_review_type NOT NULL DEFAULT 'manuel',
  note INTEGER CHECK (note >= 1 AND note <= 5),
  contenu_avis TEXT NOT NULL,
  author_name TEXT, -- Pseudo de l'utilisateur Google (champ author_name)
  gmail_message_id TEXT, -- ID du message Gmail pour éviter les doublons (déprécié)
  email_message_id TEXT, -- ID du message email pour éviter les doublons
  email_raw_content TEXT, -- Corps brut de l'email pour debug
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table ai_responses (réponses générées par l'IA)
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  ton_utilise TEXT NOT NULL,
  reponse_generee TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table subscriptions (abonnements Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan plan_type NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table gmail_credentials (tokens OAuth Gmail)
CREATE TABLE IF NOT EXISTS gmail_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  google_email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias ON business_profiles(incoming_alias) WHERE incoming_alias IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_responses_review_id ON ai_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
BEFORE UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_credentials_updated_at
BEFORE UPDATE ON gmail_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Trigger pour créer automatiquement une subscription free à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une subscription free par défaut
  -- SECURITY DEFINER permet de contourner RLS
  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création de la subscription: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;

-- Policies pour business_profiles
CREATE POLICY "Users can view own business profiles"
ON business_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business profiles"
ON business_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business profiles"
ON business_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own business profiles"
ON business_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policies pour reviews (renforcées pour garantir l'isolation via business_id)
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

-- Policies pour ai_responses (via reviews)
CREATE POLICY "Users can view own ai responses"
ON ai_responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id = ai_responses.review_id
    AND reviews.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own ai responses"
ON ai_responses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reviews
    WHERE reviews.id = ai_responses.review_id
    AND reviews.user_id = auth.uid()
  )
);

-- Policies pour subscriptions
CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Policies pour gmail_credentials
CREATE POLICY "Users can view own gmail credentials"
ON gmail_credentials FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gmail credentials"
ON gmail_credentials FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gmail credentials"
ON gmail_credentials FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own gmail credentials"
ON gmail_credentials FOR DELETE
TO authenticated
USING (user_id = auth.uid());
