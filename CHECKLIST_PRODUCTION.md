# ✅ Checklist Production - AvisPro

## 🚨 URGENT - À vérifier avant commercialisation

### 1. Variables d'environnement Netlify

Allez sur : **https://app.netlify.com/sites/avispro-app/settings/env**

Vérifiez que TOUTES ces variables sont configurées :

#### ✅ Supabase (OBLIGATOIRE)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = https://votre-projet.supabase.co
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGci...
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGci... (SECRET)

#### ✅ Stripe (OBLIGATOIRE)
- [ ] `STRIPE_SECRET_KEY` = sk_live_... (ou sk_test_...)
- [ ] `STRIPE_WEBHOOK_SECRET` = whsec_...
- [ ] `STRIPE_PRICE_ID_PRO` = price_xxx
- [ ] `STRIPE_PRICE_ID_BUSINESS` = price_xxx
- [ ] `STRIPE_PRICE_ID_AGENCE` = price_xxx

#### ✅ OpenAI (OBLIGATOIRE)
- [ ] `OPENAI_API_KEY` = sk-proj-...

#### ✅ Email - Resend (OBLIGATOIRE)
- [ ] `RESEND_API_KEY` = re_...
- [ ] `EMAIL_FROM` = no-reply@avisprofr.com
- [ ] `EMAIL_DOMAIN` = avisprofr.com

#### ✅ Application (OBLIGATOIRE)
- [ ] `NEXT_PUBLIC_APP_URL` = https://avisprofr.com (⚠️ DOIT être en HTTPS)

#### ⚠️ Google OAuth (Optionnel)
- [ ] `GOOGLE_CLIENT_ID` = xxx.apps.googleusercontent.com
- [ ] `GOOGLE_CLIENT_SECRET` = xxx
- [ ] `GOOGLE_REDIRECT_URI` = https://avisprofr.com/api/auth/gmail/callback

---

### 2. Vérification automatique

Appelez cette route après déploiement pour vérifier :
```
GET https://avisprofr.com/api/admin/check-env
```

Cette route vérifie automatiquement toutes les variables.

---

### 3. Configuration Supabase

#### Base de données
- [ ] Exécuter `supabase/schema.sql` dans SQL Editor
- [ ] Vérifier que la colonne `incoming_alias` existe dans `business_profiles`
- [ ] Vérifier que les RLS policies sont actives

#### Email
- [ ] Configurer l'email SMTP dans Supabase Dashboard
- [ ] Tester l'envoi d'email de confirmation

#### Vérification
```
GET https://avisprofr.com/api/admin/verify-production
```

---

### 4. Configuration Stripe

#### Produits
- [ ] Créer 3 produits d'abonnement :
  - Pro : 24€/mois
  - Business : 49€/mois
  - Agence : 119€/mois
- [ ] Récupérer les Price IDs et les ajouter dans Netlify

#### Webhook
- [ ] Créer un webhook pointant vers : `https://avisprofr.com/api/stripe/webhook`
- [ ] Sélectionner les événements :
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Récupérer le secret et l'ajouter dans Netlify

#### Mode Live vs Test
- [ ] **Pour la production** : Utiliser les clés `sk_live_...` et `pk_live_...`
- [ ] **Pour les tests** : Utiliser les clés `sk_test_...` et `pk_test_...`

---

### 5. Configuration Resend (Email)

- [ ] Créer un compte sur https://resend.com
- [ ] Vérifier le domaine `avisprofr.com`
- [ ] Configurer les enregistrements DNS (SPF, DKIM, DMARC)
- [ ] Récupérer la clé API et l'ajouter dans Netlify

---

### 6. Configuration Netlify

#### Build
- [ ] Vérifier que `netlify.toml` est correct
- [ ] Vérifier que la commande de build est : `pnpm build`
- [ ] Vérifier que le dossier de publication est : `.next`

#### Domain
- [ ] Vérifier que `avisprofr.com` est configuré
- [ ] Vérifier que le certificat SSL est actif (HTTPS)

#### Redirections
- [ ] Vérifier les redirections HTTP → HTTPS
- [ ] Vérifier la redirection www → non-www

---

### 7. Tests finaux

#### Fonctionnalités
- [ ] Inscription utilisateur fonctionne
- [ ] Connexion fonctionne
- [ ] Création de profil établissement fonctionne
- [ ] Création d'avis manuel fonctionne (plan free : 5 max)
- [ ] Génération de réponse IA fonctionne (plans payants uniquement)
- [ ] Abonnement Stripe fonctionne
- [ ] Webhook Stripe fonctionne

#### Sécurité
- [ ] Toutes les routes API vérifient l'authentification
- [ ] RLS est activé sur toutes les tables
- [ ] Les variables secrètes ne sont pas exposées côté client

---

### 8. Vérification rapide (5 minutes)

1. **Appeler la route de vérification** :
   ```
   GET https://avisprofr.com/api/admin/check-env
   ```
   Vérifier que tout est ✅

2. **Tester l'inscription** :
   - Aller sur https://avisprofr.com
   - Créer un compte
   - Vérifier que l'email de confirmation arrive

3. **Tester la création d'avis** :
   - Se connecter
   - Créer un profil établissement
   - Créer un avis manuel
   - Vérifier que ça fonctionne

4. **Tester l'abonnement** (si Stripe est configuré) :
   - Aller sur la page facturation
   - Cliquer sur "Passer au plan Pro"
   - Vérifier que la redirection Stripe fonctionne

---

## 🎯 Résumé

**Variables critiques à vérifier :**
1. ✅ Supabase (3 variables)
2. ✅ Stripe (5 variables)
3. ✅ OpenAI (1 variable)
4. ✅ Resend (3 variables)
5. ✅ App URL (1 variable)

**Total : 13 variables obligatoires**

**Routes de vérification :**
- `/api/admin/check-env` - Vérifie les variables d'environnement
- `/api/admin/verify-production` - Vérifie la base de données et la synchronisation

---

## ⚠️ EN CAS DE PROBLÈME

1. Vérifier les logs Netlify : https://app.netlify.com/sites/avispro-app/deploys
2. Vérifier les logs Supabase : Dashboard → Logs
3. Appeler `/api/admin/check-env` pour voir ce qui manque
4. Vérifier que toutes les variables sont bien en HTTPS (pas http://)

