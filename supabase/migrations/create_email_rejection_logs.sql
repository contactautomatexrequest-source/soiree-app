-- ============================================
-- TABLE : Logs des emails rejetés
-- ============================================
-- Permet de tracer les emails qui n'ont pas pu être rattachés à un établissement

CREATE TABLE IF NOT EXISTS email_rejection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_to TEXT NOT NULL,
  alias_extracted TEXT,
  reason TEXT NOT NULL, -- 'no_establishment_found', 'invalid_format', etc.
  message_id TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_subject TEXT,
  email_from TEXT
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_received_at ON email_rejection_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_alias ON email_rejection_logs(alias_extracted) WHERE alias_extracted IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_rejection_logs_reason ON email_rejection_logs(reason);

-- RLS : Seuls les admins peuvent voir ces logs
ALTER TABLE email_rejection_logs ENABLE ROW LEVEL SECURITY;

-- Policy : Les admins peuvent tout voir (à adapter selon votre système d'auth)
CREATE POLICY "Admins can view all rejection logs"
ON email_rejection_logs FOR SELECT
TO authenticated
USING (true); -- À remplacer par une vraie vérification d'admin

