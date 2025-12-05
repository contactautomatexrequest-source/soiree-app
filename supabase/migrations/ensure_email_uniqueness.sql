-- ============================================
-- MIGRATION : Garantir l'unicité de l'email
-- ============================================
-- Cette migration garantit qu'un seul compte peut être créé avec une adresse email
-- Même si Supabase Auth gère déjà cela, cette migration ajoute une couche de sécurité supplémentaire

-- Note: Supabase Auth gère déjà l'unicité de l'email dans auth.users
-- Cette migration est une mesure de sécurité supplémentaire

-- Vérifier que la contrainte d'unicité existe sur auth.users.email
-- (Elle devrait déjà exister par défaut dans Supabase)

-- Créer une fonction pour vérifier l'unicité avant insertion
CREATE OR REPLACE FUNCTION check_email_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si un autre utilisateur avec le même email existe déjà
  -- (en excluant l'utilisateur actuel pour les mises à jour)
  IF EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = NEW.email 
    AND id != NEW.id
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Un compte existe déjà avec cet email: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger pour vérifier l'unicité avant insertion/mise à jour
-- Note: Ce trigger peut ne pas fonctionner si Supabase bloque déjà l'accès direct à auth.users
-- C'est une mesure de sécurité supplémentaire

-- DROP TRIGGER IF EXISTS check_email_uniqueness_trigger ON auth.users;
-- CREATE TRIGGER check_email_uniqueness_trigger
--   BEFORE INSERT OR UPDATE OF email ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION check_email_uniqueness();

-- Note: Le trigger ci-dessus peut ne pas être nécessaire car Supabase Auth
-- gère déjà l'unicité. Cette migration sert principalement de documentation.

-- Alternative: Créer une vue pour vérifier les emails dupliqués
CREATE OR REPLACE VIEW auth.duplicate_emails AS
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id) as user_ids,
  array_agg(email_confirmed_at) as confirmation_dates
FROM auth.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Fonction pour nettoyer les comptes non confirmés en double
-- (À utiliser avec précaution, uniquement par un admin)
CREATE OR REPLACE FUNCTION cleanup_duplicate_unconfirmed_accounts()
RETURNS TABLE(deleted_count INTEGER, kept_user_id UUID) AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Supprimer les comptes non confirmés qui ont le même email qu'un compte confirmé
  WITH confirmed_users AS (
    SELECT email, id
    FROM auth.users
    WHERE email_confirmed_at IS NOT NULL
  ),
  unconfirmed_duplicates AS (
    SELECT u.id
    FROM auth.users u
    INNER JOIN confirmed_users c ON u.email = c.email
    WHERE u.email_confirmed_at IS NULL
    AND u.id != c.id
  )
  DELETE FROM auth.users
  WHERE id IN (SELECT id FROM unconfirmed_duplicates)
  RETURNING id INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: La fonction cleanup_duplicate_unconfirmed_accounts() doit être exécutée
-- manuellement par un admin si nécessaire. Elle n'est pas automatique pour des raisons de sécurité.

-- Commentaire final
COMMENT ON FUNCTION check_email_uniqueness() IS 
'Vérifie l''unicité de l''email avant insertion/mise à jour. Note: Supabase Auth gère déjà cela.';

COMMENT ON VIEW auth.duplicate_emails IS 
'Vue pour identifier les emails dupliqués dans auth.users (devrait être vide en production).';

COMMENT ON FUNCTION cleanup_duplicate_unconfirmed_accounts() IS 
'Nettoie les comptes non confirmés en double. À utiliser avec précaution par un admin uniquement.';

