# Politiques RLS (Row Level Security) Supabase

Toutes les politiques RLS sont définies dans `supabase/schema.sql`. Voici un résumé :

## Tables protégées

### business_profiles
- **SELECT** : Utilisateur peut voir uniquement ses propres profils
- **INSERT** : Utilisateur peut créer uniquement pour lui-même
- **UPDATE** : Utilisateur peut modifier uniquement ses propres profils
- **DELETE** : Utilisateur peut supprimer uniquement ses propres profils

### reviews
- **SELECT** : Utilisateur peut voir uniquement ses propres avis
- **INSERT** : Utilisateur peut créer uniquement pour lui-même
- **UPDATE** : Utilisateur peut modifier uniquement ses propres avis
- **DELETE** : Utilisateur peut supprimer uniquement ses propres avis

### ai_responses
- **SELECT** : Utilisateur peut voir uniquement les réponses liées à ses avis
- **INSERT** : Utilisateur peut créer uniquement pour ses propres avis

### subscriptions
- **SELECT** : Utilisateur peut voir uniquement sa propre subscription
- **UPDATE** : Utilisateur peut modifier uniquement sa propre subscription


## Sécurité

- Toutes les tables ont RLS activé
- Toutes les politiques utilisent `auth.uid()` pour vérifier l'identité
- Les opérations admin (service role) contournent RLS mais sont utilisées uniquement côté serveur

