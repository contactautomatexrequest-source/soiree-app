# Configuration Email Transfer pour AvisPro

Ce guide explique comment configurer le système de réception d'emails via transfert (remplace OAuth Gmail).

## Architecture

- Chaque établissement a une adresse email unique : `avis+ALIAS@votredomaine.com`
- Le client configure un transfert d'email dans Gmail/Outlook vers cette adresse
- Les emails sont reçus via Resend et traités par un webhook
- Les avis sont automatiquement extraits et créés dans l'application

## Étape 1 : Configuration Resend

### 1.1 Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte
3. Vérifiez votre domaine (ou utilisez le domaine de test)

### 1.2 Configurer le domaine

1. Dans Resend, allez dans **Domains**
2. Ajoutez votre domaine (ex: `reponsia.fr`)
3. Suivez les instructions DNS pour vérifier le domaine
4. Configurez les enregistrements MX pour recevoir les emails

### 1.3 Créer une API Key

1. Allez dans **API Keys**
2. Créez une nouvelle clé avec les permissions nécessaires
3. Copiez la clé API

### 1.4 Configurer le webhook

1. Allez dans **Webhooks**
2. Créez un nouveau webhook pointant vers : `https://votredomaine.com/api/email/webhook`
3. Sélectionnez les événements : `email.received` ou équivalent

## Étape 2 : Variables d'environnement

Ajoutez dans `.env.local` :

```env
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_DOMAIN=reponsia.fr
EMAIL_FROM=noreply@reponsia.fr
```

Pour la production (Netlify), ajoutez ces variables dans les paramètres Netlify.

## Étape 3 : Exécuter la migration SQL

Exécutez le fichier `supabase/migrations/email_transfer.sql` dans votre base Supabase :

```sql
-- Mettre à jour l'enum
ALTER TYPE source_review_type ADD VALUE IF NOT EXISTS 'email_auto';

-- Ajouter la colonne email_alias
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS email_alias TEXT UNIQUE;

-- Ajouter les colonnes email à reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email_message_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email_raw_content TEXT;

-- Index
CREATE INDEX IF NOT EXISTS idx_business_profiles_email_alias ON business_profiles(email_alias);
CREATE INDEX IF NOT EXISTS idx_reviews_email_message_id ON reviews(email_message_id);

-- Supprimer l'ancienne table Gmail OAuth
DROP TABLE IF EXISTS gmail_credentials CASCADE;
```

## Étape 4 : Tester le système

1. Connectez-vous à l'application
2. Allez dans **Profil établissement**
3. Une adresse email unique est générée automatiquement (ex: `avis+abc123@reponsia.fr`)
4. Cliquez sur **Copier** pour copier l'adresse
5. Dans Gmail, configurez un transfert :
   - Paramètres → Transfert et POP/IMAP
   - Ajoutez une adresse de transfert : `avis+abc123@reponsia.fr`
   - Sélectionnez "Conserver une copie dans la boîte de réception"
6. Cliquez sur **Tester la connexion** pour envoyer un email de test
7. Vérifiez que l'email arrive bien

## Étape 5 : Configuration du transfert Gmail

### Pour Gmail :

1. Ouvrez Gmail
2. Cliquez sur l'icône ⚙️ → **Voir tous les paramètres**
3. Allez dans l'onglet **Transfert et POP/IMAP**
4. Cliquez sur **Ajouter une adresse de transfert**
5. Entrez l'adresse générée (ex: `avis+abc123@reponsia.fr`)
6. Gmail enverra un code de vérification
7. Entrez le code pour confirmer
8. Sélectionnez **Conserver une copie dans la boîte de réception**
9. Cliquez sur **Enregistrer**

### Pour Outlook :

1. Ouvrez Outlook
2. Allez dans **Paramètres** → **Courrier** → **Transfert**
3. Activez le transfert
4. Entrez l'adresse générée
5. Enregistrez

## Fonctionnement

1. **Réception** : Quand un email d'avis Google arrive dans Gmail, il est automatiquement transféré vers l'adresse unique
2. **Webhook** : Resend reçoit l'email et appelle le webhook `/api/email/webhook`
3. **Extraction** : L'application extrait l'alias depuis l'adresse destinataire et trouve l'établissement correspondant
4. **Analyse** : Le contenu de l'email est analysé (regex simple ou OpenAI) pour extraire le texte de l'avis et la note
5. **Création** : Un avis est automatiquement créé dans la base avec la source `email_auto`
6. **Affichage** : L'avis apparaît dans l'historique avec le badge "📧 Importé automatiquement"

## Dépannage

### L'email de test ne fonctionne pas

- Vérifiez que `RESEND_API_KEY` est correct
- Vérifiez que le domaine est bien vérifié dans Resend
- Vérifiez les logs du webhook dans Resend

### Les avis ne sont pas créés

- Vérifiez que le webhook est bien configuré dans Resend
- Vérifiez les logs de l'application (`/api/email/webhook`)
- Vérifiez que l'alias email correspond bien à celui dans la base

### L'extraction échoue

- Les emails non analysés sont quand même sauvegardés avec `[Email non analysé]` dans le texte
- Vous pouvez les traiter manuellement depuis l'historique
- Vérifiez que `OPENAI_API_KEY` est configuré si vous utilisez l'extraction IA

## Sécurité

- L'alias est unique et aléatoire (12 caractères hexadécimaux)
- Seul l'établissement correspondant peut recevoir des avis sur cette adresse
- Les emails non reconnus sont ignorés (pas d'erreur, juste un log)
- Le webhook vérifie toujours que l'établissement existe avant de créer un avis

