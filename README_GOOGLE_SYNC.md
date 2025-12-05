# Synchronisation Google Business Profile - AvisPro

## Vue d'ensemble

Cette fonctionnalité permet la synchronisation automatique et bidirectionnelle entre Google Business Profile et AvisPro. Toutes les données sont récupérées automatiquement depuis Google et stockées de manière sécurisée dans Supabase.

## Architecture

### 1. Table `google_business_profiles`

Stocke les profils Google Business synchronisés avec :
- Identifiants Google (`google_place_id`, `google_account_id`)
- Données synchronisées (nom, adresse, note, nombre d'avis, photo, etc.)
- Tokens OAuth (access_token, refresh_token, expires_at)
- Métadonnées de synchronisation (dernière sync, prochaine sync, erreurs)

### 2. Routes API

- **`/api/google/connect`** : Initie la connexion OAuth Google
- **`/api/google/callback`** : Callback OAuth, stocke les tokens
- **`/api/google/sync`** : Synchronise les données Google (profil + avis)
- **`/api/google/list`** : Liste les profils Google de l'utilisateur
- **`/api/google/disconnect`** : Déconnecte un profil Google

### 3. Sécurité

- **RLS (Row Level Security)** : Chaque utilisateur ne voit que ses propres profils
- **Vérification serveur** : Toutes les routes vérifient `user_id` côté serveur
- **Isolation des données** : Aucun mélange possible entre établissements

## Configuration requise

### Variables d'environnement

```env
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=https://avisprofr.com/api/google/callback
GOOGLE_API_KEY=votre_api_key (optionnel, pour Places API)
```

### Configuration Google Cloud Console

1. **Créer un projet** dans Google Cloud Console
2. **Activer les APIs** :
   - Google Business Profile API
   - Places API (New)
3. **Configurer OAuth** :
   - Créer des identifiants OAuth 2.0
   - Ajouter l'URI de redirection : `https://avisprofr.com/api/google/callback`
   - Scopes requis :
     - `https://www.googleapis.com/auth/business.manage`
     - `https://www.googleapis.com/auth/places`
4. **Configurer l'écran de consentement** :
   - Type : Externe
   - Informations de l'application
   - Scopes (voir ci-dessus)

## Migration SQL

Exécutez le fichier `supabase/migrations/create_google_business_profiles.sql` dans Supabase :

```sql
-- Crée la table google_business_profiles
-- Ajoute les colonnes google_review_id et google_place_id à reviews
-- Configure les RLS policies
-- Ajoute le type 'google_sync' à source_review_type
```

## Utilisation

### 1. Connexion Google Business

1. L'utilisateur clique sur "Connecter Google Business" dans le dashboard
2. Redirection vers Google OAuth
3. Autorisation des scopes
4. Callback avec tokens stockés dans Supabase

### 2. Synchronisation automatique

La synchronisation récupère :
- **Profil** : Nom, adresse, catégorie, note moyenne, nombre d'avis, photo
- **Avis** : Tous les avis Google avec note, commentaire, auteur, date

### 3. Synchronisation manuelle

Bouton "Resynchroniser" dans le dashboard pour forcer une sync immédiate.

### 4. Synchronisation automatique (cron)

À implémenter : un cron job qui synchronise tous les profils toutes les 6 heures.

## Flux de données

```
1. Connexion OAuth
   ↓
2. Stockage des tokens
   ↓
3. Première synchronisation (manuelle ou automatique)
   ↓
4. Récupération du profil Google Business
   ↓
5. Récupération des avis Google
   ↓
6. Création/mise à jour dans Supabase
   ↓
7. Liaison avec business_profiles
   ↓
8. Affichage dans le dashboard
```

## Sécurité

### RLS Policies

```sql
-- Un utilisateur ne peut voir que ses propres profils
USING (user_id = auth.uid())

-- Un utilisateur ne peut modifier que ses propres profils
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid())
```

### Vérifications serveur

Toutes les routes API vérifient :
- Authentification de l'utilisateur
- Appartenance des données (`user_id` correspond)
- Isolation des établissements (`business_id` vérifié)

## Gestion des erreurs

- **Token expiré** : Rafraîchissement automatique via `refresh_token`
- **Erreur de sync** : Enregistrement dans `derniere_erreur`, affichage dans l'UI
- **Profil non trouvé** : Message clair à l'utilisateur
- **Avis déjà importés** : Détection via `google_review_id` unique

## Prochaines étapes

1. **Cron job** : Synchronisation automatique toutes les 6h
2. **Webhook Google** : Réception des notifications de nouveaux avis
3. **Multi-établissements** : Gestion de plusieurs profils Google par utilisateur
4. **Statistiques** : Tableau de bord avec métriques Google synchronisées

