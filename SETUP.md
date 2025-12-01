# Guide de Configuration - RéponsIA Avis V2

## 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx
STRIPE_PRICE_ID_AGENCE=price_xxx

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Gmail OAuth
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Configuration Supabase

### Étape 1 : Créer le projet
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet (région Europe)
3. Notez l'URL et les clés API

### Étape 2 : Exécuter le schéma SQL
1. Dans Supabase Dashboard → SQL Editor
2. Copiez-collez le contenu de `supabase/schema.sql`
3. Exécutez le script (Run)

### Étape 3 : Vérifier les tables
Vérifiez que les tables suivantes existent :
- `business_profiles`
- `reviews`
- `ai_responses`
- `subscriptions`

## 3. Configuration Stripe

### Étape 1 : Créer les produits
1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Créez 3 produits d'abonnement mensuel :
   - **Pro** : 24€/mois → Récupérez le Price ID
   - **Business** : 49€/mois → Récupérez le Price ID
   - **Agence** : 119€/mois → Récupérez le Price ID
3. Ajoutez les Price IDs dans `.env.local`

### Étape 2 : Configurer le webhook

**⚠️ Important : Webhooks en local vs production**

**En local :**
- Le webhook secret peut rester vide dans `.env.local`
- Les webhooks Stripe ne fonctionnent pas directement en local (Stripe ne peut pas appeler `localhost`)
- Pour tester les webhooks en local, utilisez **Stripe CLI** :
  ```bash
  # Installer Stripe CLI
  brew install stripe/stripe-cli/stripe
  
  # Se connecter
  stripe login
  
  # Écouter les événements et les forwarder vers localhost
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
  Cela vous donnera un webhook secret temporaire à utiliser en local.

**En production :**
1. Dans Stripe Dashboard → Webhooks
2. Ajoutez un endpoint : `https://votre-domaine.netlify.app/api/stripe/webhook`
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Récupérez le secret du webhook et ajoutez-le dans les variables d'environnement Netlify

## 4. Configuration OpenAI

1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez une clé API
3. Ajoutez-la dans `.env.local`


## 6. Installation et démarrage

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 7. Déploiement Netlify

1. Connectez votre repo GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify Dashboard
3. Build command : `pnpm build`
4. Publish directory : `.next`
5. Déployez !

## Notes importantes

- ⚠️ Les Price IDs Stripe doivent être configurés avant de tester les abonnements
- ⚠️ Le webhook Stripe doit être configuré avec l'URL de production
- ⚠️ Le mode simple fonctionne immédiatement après configuration du profil établissement

