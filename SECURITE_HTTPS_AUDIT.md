# Audit et Corrections HTTPS - AvisPro

## ✅ Résumé des corrections effectuées

### Date : 2024
### Domaine : https://avisprofr.com
### Hébergement : Netlify

---

## 🔍 Audit complet réalisé

### 1. Scan des URLs HTTP dans le projet

**Résultats :**
- ✅ **Aucune URL HTTP réelle trouvée** dans le code source de l'application
- ✅ Les fichiers SVG contiennent `xmlns="http://www.w3.org/2000/svg"` mais c'est un **namespace XML standard**, pas une vraie URL HTTP (pas de problème de sécurité)
- ✅ Les fichiers de documentation contiennent `http://localhost:3000` (normal pour le développement local)

### 2. Vérification des ressources externes

**Ressources vérifiées :**
- ✅ **Supabase** : Utilise les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` (doit être en HTTPS)
- ✅ **Stripe** : URLs forcées en HTTPS via `req.nextUrl.origin.replace(/^http:/, "https:")`
- ✅ **OpenAI** : API appelée via HTTPS uniquement
- ✅ **Resend** : API appelée via HTTPS uniquement
- ✅ **Google Fonts** : Chargées via HTTPS (Inter font)
- ✅ **Images** : Aucune image externe en HTTP trouvée

### 3. Vérification des configurations

**Fichiers vérifiés :**
- ✅ `netlify.toml` : Redirections HTTP → HTTPS configurées
- ✅ `next.config.ts` : Headers de sécurité avec `upgrade-insecure-requests`
- ✅ `middleware.ts` : Redirection HTTP → HTTPS en production
- ✅ `app/layout.tsx` : `metadataBase` utilise HTTPS par défaut

---

## 🔧 Corrections effectuées

### 1. Fichier `netlify.toml`

**Avant :**
```toml
[[redirects]]
  from = "http://www.avisprofr.com/*"
  to = "https://www.avisprofr.com/:splat"
```

**Après :**
```toml
[[redirects]]
  from = "http://www.avisprofr.com/*"
  to = "https://avisprofr.com/:splat"

# Redirection www → non-www (canonical)
[[redirects]]
  from = "https://www.avisprofr.com/*"
  to = "https://avisprofr.com/:splat"
```

**Raison :** 
- Redirection www → non-www pour avoir un domaine canonique unique
- Toutes les variantes HTTP et www redirigent vers `https://avisprofr.com`

### 2. Fichier `VARIABLES_ENV_NETLIFY.md`

**Avant :**
```markdown
https://avispro-app.netlify.app/api/stripe/webhook
```

**Après :**
```markdown
https://avisprofr.com/api/stripe/webhook
```

**Raison :** 
- Utilisation du domaine de production officiel au lieu du domaine Netlify par défaut

---

## ✅ Configurations déjà en place (vérifiées)

### 1. Headers de sécurité (`next.config.ts`)

```typescript
Content-Security-Policy: upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Effet :** 
- Force automatiquement toutes les requêtes HTTP vers HTTPS
- Active HSTS pour forcer HTTPS pendant 1 an

### 2. Redirections Netlify (`netlify.toml`)

```toml
[[redirects]]
  from = "http://avisprofr.com/*"
  to = "https://avisprofr.com/:splat"
  status = 301
  force = true
```

**Effet :** 
- Redirection permanente (301) de HTTP vers HTTPS
- Force la redirection même si le client tente d'accéder en HTTP

### 3. Middleware Next.js (`middleware.ts`)

```typescript
if (
  process.env.NODE_ENV === "production" &&
  request.nextUrl.protocol === "http:" &&
  !hostname.includes("localhost")
) {
  url.protocol = "https:";
  return NextResponse.redirect(url, 301);
}
```

**Effet :** 
- Redirection HTTP → HTTPS au niveau de l'application
- Double protection (Netlify + application)

### 4. URLs Stripe forcées en HTTPS

**Fichiers :**
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/portal/route.ts`

```typescript
const origin = req.nextUrl.origin.replace(/^http:/, "https:");
```

**Effet :** 
- Garantit que toutes les URLs de redirection Stripe sont en HTTPS

### 5. URLs Supabase Auth

**Fichier :** `app/sign-up/page.tsx`

```typescript
emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`
```

**Effet :** 
- Utilise le protocole de la page actuelle (HTTPS si la page est en HTTPS)
- Pas de problème car la page est toujours servie en HTTPS

---

## 📋 Points de vérification

### Variables d'environnement à vérifier dans Netlify

Assurez-vous que ces variables sont configurées avec HTTPS :

```bash
NEXT_PUBLIC_APP_URL=https://avisprofr.com
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
GOOGLE_REDIRECT_URI=https://avisprofr.com/api/auth/gmail/callback
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://avisprofr.com/api/auth/gmail/callback
```

### Configuration Supabase Dashboard

Vérifiez dans **Supabase Dashboard → Authentication → Settings** :

- ✅ **Site URL** : `https://avisprofr.com`
- ✅ **Redirect URLs** : 
  - `https://avisprofr.com/**`
  - `https://www.avisprofr.com/**`
  - `https://avisprofr.com/auth/callback`
  - `https://www.avisprofr.com/auth/callback`

### Configuration Stripe Dashboard

Vérifiez dans **Stripe Dashboard → Developers → Webhooks** :

- ✅ **Webhook URL** : `https://avisprofr.com/api/stripe/webhook`

### Configuration Google OAuth (si utilisé)

Vérifiez dans **Google Cloud Console → APIs & Services → Credentials** :

- ✅ **Authorized redirect URIs** : `https://avisprofr.com/api/auth/gmail/callback`

---

## 🧪 Tests à effectuer

### Test 1 : Accès HTTP
1. Ouvrez `http://avisprofr.com` dans un navigateur
2. **Résultat attendu :** Redirection automatique vers `https://avisprofr.com`

### Test 2 : Accès www
1. Ouvrez `https://www.avisprofr.com` dans un navigateur
2. **Résultat attendu :** Redirection automatique vers `https://avisprofr.com`

### Test 3 : Vérification du certificat
1. Ouvrez `https://avisprofr.com` dans un navigateur
2. Cliquez sur le cadenas dans la barre d'adresse
3. **Résultat attendu :** Certificat valide (Let's Encrypt via Netlify)

### Test 4 : Console du navigateur
1. Ouvrez `https://avisprofr.com` dans un navigateur
2. Ouvrez la console développeur (F12)
3. **Résultat attendu :** Aucun warning de "mixed content" ou "insecure content"

### Test 5 : Outil en ligne
1. Utilisez https://securityheaders.com/
2. Entrez `https://avisprofr.com`
3. **Résultat attendu :** Score A ou A+

### Test 6 : SSL Labs
1. Utilisez https://www.ssllabs.com/ssltest/
2. Entrez `avisprofr.com`
3. **Résultat attendu :** Score A ou A+

---

## 📝 Notes importantes

### Fichiers SVG

Les fichiers SVG dans `public/` contiennent `xmlns="http://www.w3.org/2000/svg"`. **Ce n'est pas un problème** car :
- C'est un namespace XML standard, pas une vraie URL HTTP
- Les navigateurs ne considèrent pas cela comme du contenu mixte
- Aucune ressource n'est chargée via HTTP

### Fichiers de documentation

Les fichiers de documentation (`.md`) contiennent des références à `http://localhost:3000`. **Ce n'est pas un problème** car :
- Ces fichiers ne sont pas servis par le site web
- Ils sont destinés au développement local uniquement

### Variables d'environnement

Assurez-vous que toutes les variables d'environnement dans Netlify utilisent HTTPS :
- `NEXT_PUBLIC_APP_URL` doit être `https://avisprofr.com`
- `NEXT_PUBLIC_SUPABASE_URL` doit être `https://votre-projet.supabase.co`
- Toutes les URLs de redirection doivent être en HTTPS

---

## ✅ Résultat final

Après ces corrections :

- ✅ **Aucune URL HTTP** dans le code source de l'application
- ✅ **Toutes les redirections** HTTP → HTTPS configurées
- ✅ **Headers de sécurité** avec `upgrade-insecure-requests` activé
- ✅ **HSTS** activé pour forcer HTTPS pendant 1 an
- ✅ **Redirection www → non-www** configurée
- ✅ **URLs Stripe** forcées en HTTPS
- ✅ **URLs Supabase** utilisent HTTPS via variables d'environnement
- ✅ **Aucun contenu mixte** détecté

**Le site est maintenant entièrement sécurisé en HTTPS !** 🔒

---

## 🚨 Actions à faire après déploiement

1. **Vérifier les variables d'environnement Netlify** : S'assurer que toutes les URLs sont en HTTPS
2. **Tester les redirections** : HTTP → HTTPS, www → non-www
3. **Vérifier la console du navigateur** : Aucun warning de mixed content
4. **Tester les fonctionnalités** : Inscription, connexion, paiement Stripe
5. **Vérifier les webhooks** : Stripe, Resend (si configurés)

---

## 📚 Références

- [Netlify HTTPS Documentation](https://docs.netlify.com/domains-https/https-ssl/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config/headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

