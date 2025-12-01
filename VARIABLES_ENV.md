# Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec toutes ces variables :

## Supabase (3 variables)

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

**Où les trouver :**
- Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
- Sélectionnez votre projet
- Settings → API
- Copiez l'URL et les deux clés

## Stripe (5 variables)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx
STRIPE_PRICE_ID_AGENCE=price_xxx
```

**Où les trouver :**
- Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
- Developers → API keys → Copiez les clés publiques et secrètes
- Products → Créez 3 produits d'abonnement mensuel (24€, 49€, 119€) → Copiez les Price IDs
- Developers → Webhooks → Créez un webhook → Copiez le secret

## OpenAI (1 variable)

```env
OPENAI_API_KEY=sk-proj-...
```

**Où les trouver :**
- Allez sur [platform.openai.com](https://platform.openai.com)
- API keys → Create new secret key
- Copiez la clé (elle ne s'affichera qu'une fois !)


## App (1 variable)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Pour la production :**
- Remplacez par votre URL Netlify : `https://votre-domaine.netlify.app`

---

## Exemple de fichier `.env.local` complet

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
STRIPE_PRICE_ID_PRO=price_1AbCdEfGhIjKlMnOpQrStUv
STRIPE_PRICE_ID_BUSINESS=price_1XyZaBcDeFgHiJkLmNoPqRs
STRIPE_PRICE_ID_AGENCE=price_1MnOpQrStUvWxYzAbCdEfGh

# OpenAI
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890


# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ⚠️ Important

- Ne commitez JAMAIS le fichier `.env.local` dans Git
- Pour la production sur Netlify, ajoutez ces variables dans Netlify Dashboard → Site settings → Environment variables
- Les variables `NEXT_PUBLIC_*` sont accessibles côté client (ne mettez jamais de secrets dedans)
- Les autres variables sont uniquement côté serveur (sécurisées)

