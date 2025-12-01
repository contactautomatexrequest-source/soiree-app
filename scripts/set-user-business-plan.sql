-- Script pour mettre l'utilisateur contact.automatex.request en plan business
-- Utilisez ce script dans l'éditeur SQL de Supabase

-- Trouver l'utilisateur et mettre à jour son abonnement
UPDATE subscriptions
SET 
  plan = 'business',
  status = 'active',
  updated_at = NOW()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'contact.automatex.request'
);

-- Vérifier le résultat
SELECT 
  u.email,
  s.plan,
  s.status,
  s.updated_at
FROM auth.users u
JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'contact.automatex.request';

