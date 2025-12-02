# AvisPro - La protection automatique de ta réputation

SaaS pour générer automatiquement des réponses professionnelles aux avis Google avec l'IA.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + DB + RLS)
- **Stripe** (Abonnements)
- **OpenAI** (Génération de réponses)
- **Netlify** (Déploiement)

## Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir les valeurs dans .env.local

# Lancer le serveur de développement
pnpm dev
```

## Configuration

### Variables d'environnement requises

Voir `.env.local.example` pour la liste complète.

### Supabase

1. Créer un projet Supabase (région Europe)
2. Exécuter le schéma SQL : `supabase/schema.sql`
3. Configurer les variables dans `.env.local`

### Stripe

1. Créer les produits/prix dans Stripe Dashboard
2. Récupérer les Price IDs et les configurer dans `.env.local`
3. Configurer le webhook : `https://votre-domaine.netlify.app/api/stripe/webhook`

### OpenAI

1. Créer une clé API OpenAI
2. Configurer dans `.env.local`

### Gmail OAuth

1. Créer un projet Google Cloud
2. Activer Gmail API
3. Créer des credentials OAuth 2.0
4. Configurer l'URI de redirection : `http://localhost:3000/api/auth/gmail/callback`
5. Configurer dans `.env.local`

## Déploiement Netlify

1. Connecter le repo GitHub à Netlify
2. Configurer les variables d'environnement dans Netlify
3. Déployer

## Structure

```
app/
  (public)/          # Pages publiques (landings métier)
  app/               # Pages app (protégées)
  api/               # Routes API
components/          # Composants React
lib/                 # Utilitaires (Supabase, Stripe, OpenAI)
supabase/            # Schéma SQL
```

## Fonctionnalités

- ✅ Auth Supabase
- ✅ Onboarding (choix métier + profil)
- ✅ Mode simple (coller avis → réponse IA)
- ✅ Historique des avis
- ✅ Abonnements Stripe (Free, Pro, Business, Agence)
- ✅ 5 landing pages SEO par métier
- ✅ RLS strict sur toutes les tables
