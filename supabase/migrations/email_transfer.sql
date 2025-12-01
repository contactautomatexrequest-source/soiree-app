-- ============================================
-- MIGRATION EMAIL TRANSFER (remplace Gmail OAuth)
-- ============================================

-- Mettre à jour l'enum source_review_type pour inclure 'email_auto'
ALTER TYPE source_review_type ADD VALUE IF NOT EXISTS 'email_auto';

-- Ajouter la colonne email_alias à business_profiles
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS email_alias TEXT UNIQUE;

-- Ajouter les colonnes email à reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email_message_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email_raw_content TEXT;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_business_profiles_email_alias ON business_profiles(email_alias);
CREATE INDEX IF NOT EXISTS idx_reviews_email_message_id ON reviews(email_message_id);

-- Supprimer la table gmail_credentials si elle existe (migration depuis OAuth)
DROP TABLE IF EXISTS gmail_credentials CASCADE;

