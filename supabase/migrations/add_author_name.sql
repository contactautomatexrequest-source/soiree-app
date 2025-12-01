-- Ajouter la colonne author_name à la table reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_reviews_author_name ON reviews(author_name);

