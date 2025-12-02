# Configuration Supabase - AvisPro

## 📋 Checklist de configuration Supabase

### 1. ✅ Variables d'environnement

Dans votre projet Supabase, récupérez ces valeurs depuis **Settings → API** :

- `NEXT_PUBLIC_SUPABASE_URL` : Project URL (ex: `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` : service_role key (⚠️ SECRET)

**Où configurer :**
- Netlify : https://app.netlify.com/projects/avispro-app/configuration/env
- Ajoutez ces 3 variables

---

### 2. ✅ Configuration Email (OBLIGATOIRE)

Dans **Supabase Dashboard → Authentication → Settings** :

#### A. Email Auth
- ✅ **Enable email confirmations** : **ACTIVÉ** (obligatoire)
- ✅ **Enable email signup** : Activé

#### B. Site URL
```
https://avisprofr.com
```

#### C. Redirect URLs (ajoutez toutes ces URLs)
```
https://avisprofr.com/**
https://www.avisprofr.com/**
https://avisprofr.com/auth/callback
https://www.avisprofr.com/auth/callback
```

#### D. Email Templates
1. Allez dans **Authentication → Email Templates**
2. Modifiez le template **"Confirm signup"** si nécessaire
3. Le lien de confirmation doit pointer vers :
   ```
   {{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup
   ```

---

### 3. ✅ Configuration du schéma SQL

Exécutez le fichier `supabase/schema.sql` dans **Supabase Dashboard → SQL Editor** :

1. Copiez le contenu de `supabase/schema.sql`
2. Collez dans l'éditeur SQL
3. Cliquez sur **Run**

Cela créera :
- Les tables (`business_profiles`, `reviews`, `ai_responses`, `subscriptions`, `gmail_credentials`)
- Les triggers (création automatique de subscription à l'inscription)
- Les policies RLS (Row Level Security)

---

### 4. ✅ Vérification RLS (Row Level Security)

Vérifiez que RLS est activé sur toutes les tables :

**Supabase Dashboard → Table Editor → Sélectionnez chaque table → Settings → RLS**

Tables concernées :
- ✅ `business_profiles` : RLS activé
- ✅ `reviews` : RLS activé
- ✅ `ai_responses` : RLS activé
- ✅ `subscriptions` : RLS activé
- ✅ `gmail_credentials` : RLS activé

---

### 5. ✅ Test de l'inscription

1. Allez sur https://avisprofr.com/sign-up
2. Créez un compte avec un email valide
3. **Vérifiez votre boîte email** : vous devriez recevoir un email de confirmation
4. Cliquez sur le lien dans l'email
5. Vous serez redirigé vers `/app/valider` et connecté automatiquement

---

## 🚨 Problèmes courants

### "Email confirmation not sent"
- Vérifiez que **"Enable email confirmations"** est activé dans Supabase
- Vérifiez les logs Supabase : **Logs → Auth Logs**
- Vérifiez que l'email n'est pas dans les spams

### "Invalid redirect URL"
- Vérifiez que toutes les URLs de redirection sont bien ajoutées dans Supabase
- Les URLs doivent être en HTTPS en production

### "User not found after signup"
- Vérifiez que le trigger `handle_new_user` a bien créé la subscription
- Vérifiez les logs Supabase : **Logs → Postgres Logs**

### "RLS policy violation"
- Vérifiez que les policies RLS sont bien créées
- Vérifiez que l'utilisateur est bien authentifié (`auth.uid()`)

---

## 📝 Notes importantes

- ⚠️ **Email confirmation obligatoire** : Les utilisateurs doivent vérifier leur email avant de pouvoir se connecter
- ⚠️ **Site URL en HTTPS** : Obligatoire pour la sécurité
- ⚠️ **Service Role Key** : Ne jamais exposer côté client, uniquement dans les API routes serveur

---

## 🔗 Liens utiles

- Dashboard Supabase : https://supabase.com/dashboard
- Documentation Auth : https://supabase.com/docs/guides/auth
- Documentation RLS : https://supabase.com/docs/guides/auth/row-level-security

