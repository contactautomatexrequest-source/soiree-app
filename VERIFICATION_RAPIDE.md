# 🚨 VÉRIFICATION RAPIDE - 5 MINUTES

## ⚡ Action immédiate

### 1. Vérifier les variables Netlify (2 min)

Allez sur : **https://app.netlify.com/sites/avispro-app/settings/env**

**Copiez-collez cette liste et cochez chaque variable :**

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ STRIPE_SECRET_KEY
✅ STRIPE_WEBHOOK_SECRET
✅ STRIPE_PRICE_ID_PRO
✅ STRIPE_PRICE_ID_BUSINESS
✅ STRIPE_PRICE_ID_AGENCE
✅ OPENAI_API_KEY
✅ RESEND_API_KEY
✅ EMAIL_FROM
✅ EMAIL_DOMAIN
✅ NEXT_PUBLIC_APP_URL (doit être https://avisprofr.com)
```

### 2. Vérification automatique (30 sec)

Après le déploiement, appelez :
```
https://avisprofr.com/api/admin/check-env
```

Cette route vous dira exactement ce qui manque.

### 3. Test rapide (2 min)

1. **Inscription** : https://avisprofr.com → Créer un compte
2. **Vérifier email** : L'email de confirmation doit arriver
3. **Créer un avis** : Se connecter → Historique → "+ Ajouter un avis"

---

## 📋 Liste complète des variables

### Supabase (3)
- `NEXT_PUBLIC_SUPABASE_URL` = https://xxx.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGci...
- `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGci... (SECRET)

### Stripe (5)
- `STRIPE_SECRET_KEY` = sk_live_... ou sk_test_...
- `STRIPE_WEBHOOK_SECRET` = whsec_...
- `STRIPE_PRICE_ID_PRO` = price_xxx
- `STRIPE_PRICE_ID_BUSINESS` = price_xxx
- `STRIPE_PRICE_ID_AGENCE` = price_xxx

### OpenAI (1)
- `OPENAI_API_KEY` = sk-proj-...

### Resend Email (3)
- `RESEND_API_KEY` = re_...
- `EMAIL_FROM` = no-reply@avisprofr.com
- `EMAIL_DOMAIN` = avisprofr.com

### App (1)
- `NEXT_PUBLIC_APP_URL` = https://avisprofr.com

**Total : 13 variables obligatoires**

---

## ⚠️ Points critiques

1. **NEXT_PUBLIC_APP_URL** : DOIT être en HTTPS (pas http://)
2. **STRIPE_SECRET_KEY** : Utiliser `sk_live_...` pour la production
3. **SUPABASE_SERVICE_ROLE_KEY** : Ne JAMAIS exposer côté client
4. **Toutes les variables** : Doivent être configurées dans Netlify, pas seulement en local

---

## 🔍 En cas de problème

1. Vérifier les logs Netlify : https://app.netlify.com/sites/avispro-app/deploys
2. Appeler `/api/admin/check-env` pour voir ce qui manque
3. Vérifier que toutes les variables sont bien en HTTPS

---

## ✅ Checklist finale

- [ ] Toutes les 13 variables sont configurées dans Netlify
- [ ] `/api/admin/check-env` retourne tout ✅
- [ ] L'inscription fonctionne
- [ ] L'email de confirmation arrive
- [ ] La création d'avis fonctionne
- [ ] Le site est en HTTPS

**Si tout est ✅, vous êtes prêt ! 🚀**

