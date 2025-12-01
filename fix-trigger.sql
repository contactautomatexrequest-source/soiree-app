-- Correction du trigger handle_new_user et ajout de la policy INSERT

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer la fonction avec meilleure gestion d'erreurs
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

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Ajouter la policy INSERT manquante
CREATE POLICY IF NOT EXISTS "Users can insert own subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
