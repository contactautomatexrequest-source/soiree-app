# Vérification Configuration Email Supabase

## 🚨 Problème : Email de vérification non envoyé

Si les emails de vérification ne sont pas envoyés lors de l'inscription, vérifiez ces points :

## ✅ Checklist Configuration Supabase

### 1. Configuration Email Auth (OBLIGATOIRE)

Dans **Supabase Dashboard → Authentication → Settings → Email Auth** :

- ✅ **Enable email signup** : **ACTIVÉ**
- ✅ **Enable email confirmations** : **ACTIVÉ** (CRITIQUE)
- ✅ **Secure email change** : Activé (recommandé)

### 2. Site URL et Redirect URLs

Dans **Supabase Dashboard → Authentication → URL Configuration** :

**Site URL** :
```
https://avisprofr.com
```

**Redirect URLs** (ajoutez toutes ces URLs) :
```
https://avisprofr.com/**
https://www.avisprofr.com/**
https://avisprofr.com/auth/callback
https://www.avisprofr.com/auth/callback
http://localhost:3000/auth/callback (pour le développement)
```

### 3. Email Provider Configuration

Dans **Supabase Dashboard → Settings → Auth → SMTP Settings** :

#### Option A : Utiliser Supabase Email (par défaut, limité)
- ✅ Activé par défaut
- ⚠️ Limite : 3 emails/heure en développement
- ⚠️ Limite : 4 emails/jour en production (plan gratuit)

#### Option B : Configurer un SMTP personnalisé (RECOMMANDÉ pour production)

1. Allez dans **Settings → Auth → SMTP Settings**
2. Activez **"Enable Custom SMTP"**
3. Configurez avec votre fournisseur email (ex: Resend, SendGrid, Mailgun) :

**Exemple avec Resend** :
```
SMTP Host: smtp.resend.com
SMTP Port: 465 (SSL) ou 587 (TLS)
SMTP User: resend
SMTP Password: re_xxxxxxxxxxxxx (votre API key Resend)
Sender Email: no-reply@avisprofr.com
Sender Name: AvisPro
```

### 4. Email Templates

Dans **Supabase Dashboard → Authentication → Email Templates** :

#### Template "Confirm signup" :

Vérifiez que le lien de confirmation pointe vers :
```
{{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup
```

Ou avec la nouvelle méthode (code) :
```
{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=signup
```

**Contenu du template** (exemple) :
```
Bonjour,

Clique sur le lien ci-dessous pour confirmer ton compte AvisPro :

{{ .ConfirmationURL }}

Si tu n'as pas créé de compte, ignore cet email.

L'équipe AvisPro
```

### 5. Vérification des Logs

Dans **Supabase Dashboard → Logs → Auth Logs** :

1. Vérifiez les logs d'authentification
2. Recherchez les erreurs liées à l'envoi d'emails
3. Vérifiez les rate limits

### 6. Variables d'environnement

Vérifiez que ces variables sont bien configurées dans Netlify :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

## 🔧 Solutions aux problèmes courants

### Problème 1 : "Email not sent" / "Email confirmation not sent"

**Causes possibles** :
- Email confirmations désactivé
- Rate limit atteint (plan gratuit Supabase)
- SMTP mal configuré
- Email dans les spams

**Solutions** :
1. Vérifiez que "Enable email confirmations" est activé
2. Configurez un SMTP personnalisé (Resend recommandé)
3. Vérifiez les logs Supabase
4. Vérifiez le dossier spam de l'utilisateur

### Problème 2 : "User already registered" mais email non envoyé

**Cause** : L'utilisateur existe déjà mais l'email n'a jamais été confirmé

**Solution** :
- Utiliser "Resend confirmation email" dans Supabase Dashboard
- Ou utiliser la fonctionnalité "Renvoyer l'email" dans l'interface

### Problème 3 : Plusieurs comptes avec le même email

**Cause** : Supabase permet parfois la création de comptes non confirmés avec le même email

**Solution** :
- ✅ Code mis à jour pour vérifier l'unicité avant l'inscription
- ✅ Contrainte d'unicité dans auth.users (gérée par Supabase)
- ✅ Vérification côté serveur via `/api/auth/check-email`

## 📝 Test de l'envoi d'email

1. Allez sur https://avisprofr.com/sign-up
2. Créez un compte avec un email valide
3. Vérifiez votre boîte email (et les spams)
4. Cliquez sur le lien de confirmation
5. Vous devriez être redirigé vers `/sign-in?account_created=true`

## 🔒 Sécurité

- ✅ L'unicité de l'email est garantie par Supabase Auth
- ✅ Vérification supplémentaire côté serveur via API
- ✅ Vérification côté client avant l'inscription
- ✅ Messages d'erreur clairs pour l'utilisateur

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs Supabase : **Dashboard → Logs → Auth Logs**
2. Vérifiez la configuration SMTP : **Settings → Auth → SMTP Settings**
3. Contactez le support Supabase si nécessaire

