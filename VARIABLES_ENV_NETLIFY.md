# Variables d'environnement pour Netlify - AvisPro

## 📋 Liste complète des variables à configurer dans Netlify

Allez sur : **https://app.netlify.com/projects/avispro-app/configuration/env**

### 🔐 Supabase (OBLIGATOIRE)

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

**Où trouver :**
- Dashboard Supabase → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` : Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` : service_role key (⚠️ SECRET, ne jamais exposer côté client)

---

### 💳 Stripe (OBLIGATOIRE)

```
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... pour les tests)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx
STRIPE_PRICE_ID_AGENCE=price_xxx
```

**Où trouver :**
- Dashboard Stripe → Developers → API keys
- Dashboard Stripe → Products → Récupérer les Price IDs
- Dashboard Stripe → Developers → Webhooks → Récupérer le secret

**⚠️ Important :** Configurez le webhook Stripe pour pointer vers :
```
https://avispro-app.netlify.app/api/stripe/webhook
```

---

### 🤖 OpenAI (OBLIGATOIRE)

```
OPENAI_API_KEY=sk-proj-...
```

**Où trouver :**
- https://platform.openai.com/api-keys

---

### 📧 Email - Resend (OBLIGATOIRE)

```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@avisprofr.com
EMAIL_DOMAIN=avisprofr.com
```

**Où trouver :**
- https://resend.com/api-keys
- Configurez votre domaine dans Resend Dashboard

---

### 🌐 Application (OBLIGATOIRE)

```
NEXT_PUBLIC_APP_URL=https://avisprofr.com
```

**⚠️ CRITIQUE :** Doit être en HTTPS pour la sécurité !

---

### 🔑 Google OAuth (Optionnel - pour Gmail)

```
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_REDIRECT_URI=https://avisprofr.com/api/auth/gmail/callback
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://avisprofr.com/api/auth/gmail/callback
```

**Où trouver :**
- Google Cloud Console → APIs & Services → Credentials
- Configurez les Authorized redirect URIs en HTTPS

---

## ✅ Vérification après configuration

1. **Redéployez l'application** sur Netlify
2. **Testez la connexion** : https://avisprofr.com/sign-in
3. **Testez l'inscription** : https://avisprofr.com/sign-up
4. **Vérifiez les logs** : Netlify Dashboard → Functions → Logs

---

## 🔒 Sécurité

- ✅ Toutes les variables commençant par `NEXT_PUBLIC_` sont exposées côté client
- ✅ Les autres variables sont **SECRÈTES** et ne doivent jamais être exposées
- ✅ Ne commitez **JAMAIS** ces variables dans Git
- ✅ Utilisez des valeurs différentes pour développement et production

---

## 📝 Configuration Supabase Email (OBLIGATOIRE)

Dans Supabase Dashboard → Authentication → Settings :

1. **Enable email confirmations** : ✅ **ACTIVÉ** (obligatoire)
2. **Site URL** : `https://avisprofr.com`
3. **Redirect URLs** : Ajoutez ces URLs autorisées :
   - `https://avisprofr.com/**`
   - `https://www.avisprofr.com/**`
   - `https://avisprofr.com/auth/callback`
   - `https://www.avisprofr.com/auth/callback`
4. **Email Templates** : 
   - Personnalisez le template "Confirm signup" si nécessaire
   - Le lien de confirmation doit pointer vers : `https://avisprofr.com/auth/callback?token={{ .Token }}&type=signup`

**⚠️ IMPORTANT :** 
- L'email confirmation doit être **ACTIVÉ** pour que les utilisateurs reçoivent l'email de vérification
- Sans cette configuration, les utilisateurs ne pourront pas se connecter après inscription

---

## 🚨 Problèmes courants

### "Supabase environment variables are not set"
→ Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien définies

### "STRIPE_SECRET_KEY is not set"
→ Vérifiez que `STRIPE_SECRET_KEY` est bien définie (sans `NEXT_PUBLIC_`)

### "Site not secure" dans le navigateur
→ Vérifiez que `NEXT_PUBLIC_APP_URL` est en HTTPS

### Emails de confirmation non reçus
→ Vérifiez la configuration Supabase Email et les paramètres Resend

