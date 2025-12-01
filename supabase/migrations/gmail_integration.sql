-- ============================================
-- MIGRATION GMAIL INTEGRATION
-- ============================================

-- Mettre à jour l'enum source_review_type pour inclure 'gmail'
ALTER TYPE source_review_type ADD VALUE IF NOT EXISTS 'gmail';

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

-- Ajouter la colonne gmail_message_id à reviews si elle n'existe pas
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS gmail_message_id TEXT;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gmail_message_id ON reviews(gmail_message_id);

-- Trigger pour updated_at
CREATE TRIGGER update_gmail_credentials_updated_at
BEFORE UPDATE ON gmail_credentials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;

-- Policies pour gmail_credentials
DROP POLICY IF EXISTS "Users can view own gmail credentials" ON gmail_credentials;
CREATE POLICY "Users can view own gmail credentials"
ON gmail_credentials FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own gmail credentials" ON gmail_credentials;
CREATE POLICY "Users can insert own gmail credentials"
ON gmail_credentials FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own gmail credentials" ON gmail_credentials;
CREATE POLICY "Users can update own gmail credentials"
ON gmail_credentials FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own gmail credentials" ON gmail_credentials;
CREATE POLICY "Users can delete own gmail credentials"
ON gmail_credentials FOR DELETE
TO authenticated
USING (user_id = auth.uid());

