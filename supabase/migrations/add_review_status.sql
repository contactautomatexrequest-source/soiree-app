-- ============================================
-- MIGRATION: Ajout du statut aux avis
-- ============================================

-- Enum pour les statuts des avis
CREATE TYPE review_status_type AS ENUM ('nouveau', 'reponse_prête', 'publié', 'ignoré');

-- Ajouter la colonne status à reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status review_status_type DEFAULT 'nouveau';

-- Index pour améliorer les performances des requêtes par statut
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created_at ON reviews(status, created_at DESC);

-- Mettre à jour les avis existants qui ont déjà une réponse AI
UPDATE reviews
SET status = 'reponse_prête'
WHERE EXISTS (
  SELECT 1 FROM ai_responses
  WHERE ai_responses.review_id = reviews.id
)
AND status = 'nouveau';

