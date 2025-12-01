# Configuration Gmail OAuth pour RéponsIA Avis

Ce guide vous explique comment configurer la connexion Gmail OAuth pour récupérer automatiquement les avis Google.

## Étape 1 : Configuration Google Cloud Console

### 1.1 Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Nommez-le "RéponsIA Avis" ou similaire

### 1.2 Activer l'API Gmail

1. Dans le menu latéral, allez dans **APIs & Services** > **Library**
2. Recherchez "Gmail API"
3. Cliquez sur **Enable** pour activer l'API

### 1.3 Configurer l'écran de consentement OAuth

1. Allez dans **APIs & Services** > **OAuth consent screen**
2. Choisissez **External** (pour les utilisateurs externes)
3. Remplissez les informations :
   - **App name** : RéponsIA Avis
   - **User support email** : votre email
   - **Developer contact information** : votre email
4. Cliquez sur **Save and Continue**
5. Dans **Scopes**, ajoutez :
   - `https://www.googleapis.com/auth/gmail.readonly` (Lecture seule des emails)
6. Cliquez sur **Save and Continue**
7. Ajoutez des utilisateurs de test si nécessaire (pour le mode test)
8. Cliquez sur **Save and Continue**

### 1.4 Créer les identifiants OAuth

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Choisissez **Web application**
4. Configurez :
   - **Name** : RéponsIA Avis Web Client
   - **Authorized JavaScript origins** :
     - `http://localhost:3000` (pour le développement)
     - `https://votre-domaine.com` (pour la production)
   - **Authorized redirect URIs** :
     - `http://localhost:3000/api/gmail/callback` (pour le développement)
     - `https://votre-domaine.com/api/gmail/callback` (pour la production)
5. Cliquez sur **Create**
6. **Copiez le Client ID et le Client Secret** (vous en aurez besoin)

## Étape 2 : Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Pour la production (Netlify), ajoutez ces variables dans les paramètres Netlify :
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (ex: `https://votre-domaine.com/api/gmail/callback`)
- `NEXT_PUBLIC_APP_URL` (ex: `https://votre-domaine.com`)

## Étape 3 : Exécuter le schéma SQL

Exécutez le fichier `supabase/schema.sql` dans votre base Supabase pour créer la table `gmail_credentials` et mettre à jour l'enum `source_review_type`.

## Étape 4 : Tester la connexion

1. Démarrez votre serveur : `pnpm dev`
2. Connectez-vous à votre application
3. Allez dans **Profil établissement**
4. Cliquez sur **Connecter Gmail**
5. Autorisez l'application dans Google
6. Vous serez redirigé vers votre application avec Gmail connecté

## Étape 5 : Synchroniser les avis

1. Dans **Profil établissement**, cliquez sur **Synchroniser maintenant**
2. L'application va :
   - Rechercher les emails de notification Google Reviews dans Gmail
   - Extraire les avis et les notes
   - Créer des avis dans votre application
3. Les avis apparaîtront dans **Historique** avec le badge "📧 Importé depuis Gmail"

## Notes importantes

- **Sécurité** : Les tokens sont stockés de manière sécurisée dans Supabase avec RLS activé
- **Scopes minimaux** : L'application demande uniquement la lecture des emails (`gmail.readonly`)
- **Pas d'envoi** : L'application ne peut pas envoyer d'emails, uniquement les lire
- **Refresh tokens** : Les tokens sont automatiquement rafraîchis lorsqu'ils expirent
- **Déconnexion** : L'utilisateur peut déconnecter Gmail à tout moment depuis le profil

## Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Cloud Console correspond exactement à `GOOGLE_REDIRECT_URI`
- Les URLs doivent être identiques (http vs https, trailing slash, etc.)

### Erreur "invalid_client"
- Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
- Assurez-vous qu'ils ne contiennent pas d'espaces

### Aucun email trouvé
- Vérifiez que vous avez bien reçu des emails de notification Google Reviews
- Les emails doivent provenir de `noreply@google.com` ou `reviews-noreply@google.com`
- La synchronisation recherche les 7 derniers jours par défaut

### Token expiré
- L'application rafraîchit automatiquement les tokens
- Si le problème persiste, déconnectez et reconnectez Gmail

