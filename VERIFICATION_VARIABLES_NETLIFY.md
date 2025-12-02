# ✅ Vérification des Variables d'Environnement Netlify

## 📊 Variables détectées

**Total :** 12 variables d'environnement configurées

### Variables présentes :

1. ✅ `EMAIL_DOMAIN` - Configurée
2. ✅ `EMAIL_FROM` - Configurée
3. ✅ `NEXT_PUBLIC_APP_URL` - **CRITIQUE** - Doit être `https://avisprofr.com`
4. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configurée
5. ✅ `NEXT_PUBLIC_SUPABASE_URL` - **CRITIQUE** - Doit être en HTTPS
6. ✅ `OPENAI_API_KEY` - Configurée
7. ✅ `STRIPE_PRICE_ID_AGENCE` - Configurée
8. ✅ `STRIPE_PRICE_ID_BUSINESS` - Configurée
9. ✅ `STRIPE_PRICE_ID_PRO` - Configurée
10. ✅ `STRIPE_SECRET_KEY` - Configurée
11. ✅ `SUPABASE_SERVICE_ROLE_KEY` - Configurée
12. ✅ `NODE_VERSION` - Configurée (Builds, Post processing)

---

## ⚠️ Variables à vérifier manuellement

### 1. `NEXT_PUBLIC_APP_URL` (CRITIQUE)

**Doit être :**
```
https://avisprofr.com
```

**❌ Ne doit PAS être :**
- `http://avisprofr.com`
- `http://localhost:3000`
- `https://avispro-app.netlify.app`
- Toute autre URL

**Comment vérifier :**
1. Allez sur : https://app.netlify.com/projects/avisprofr-app/configuration/env
2. Cherchez `NEXT_PUBLIC_APP_URL`
3. Vérifiez que la valeur est exactement : `https://avisprofr.com`

---

### 2. `NEXT_PUBLIC_SUPABASE_URL` (CRITIQUE)

**Doit être :**
```
https://votre-projet.supabase.co
```

**❌ Ne doit PAS être :**
- `http://votre-projet.supabase.co`
- Toute URL en HTTP

**Comment vérifier :**
1. Allez sur : https://app.netlify.com/projects/avisprofr-app/configuration/env
2. Cherchez `NEXT_PUBLIC_SUPABASE_URL`
3. Vérifiez que la valeur commence par `https://`

---

### 3. Variables manquantes possibles

Vérifiez si ces variables sont présentes (optionnelles mais recommandées) :

- `RESEND_API_KEY` - Pour l'envoi d'emails
- `STRIPE_WEBHOOK_SECRET` - Pour les webhooks Stripe
- `GOOGLE_CLIENT_ID` - Si vous utilisez Google OAuth
- `GOOGLE_CLIENT_SECRET` - Si vous utilisez Google OAuth
- `GOOGLE_REDIRECT_URI` - Si vous utilisez Google OAuth (doit être en HTTPS)
- `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` - Si vous utilisez Google OAuth (doit être en HTTPS)

---

## 🔍 Comment vérifier les valeurs

### Méthode 1 : Via Netlify Dashboard (Recommandé)

1. Allez sur : https://app.netlify.com/projects/avisprofr-app/configuration/env
2. Cliquez sur chaque variable pour voir sa valeur
3. Vérifiez que toutes les URLs sont en HTTPS

### Méthode 2 : Via CLI Netlify

```bash
# Vérifier une variable spécifique
npx netlify-cli env:get NEXT_PUBLIC_APP_URL

# Lister toutes les variables (valeurs masquées)
npx netlify-cli env:list
```

---

## ✅ Checklist de vérification

### Variables critiques (OBLIGATOIRES)

- [ ] `NEXT_PUBLIC_APP_URL` = `https://avisprofr.com` (HTTPS uniquement)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://votre-projet.supabase.co` (HTTPS uniquement)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Présente et valide
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Présente et valide
- [ ] `STRIPE_SECRET_KEY` = Présente et valide
- [ ] `STRIPE_PRICE_ID_PRO` = Présente et valide
- [ ] `STRIPE_PRICE_ID_BUSINESS` = Présente et valide
- [ ] `STRIPE_PRICE_ID_AGENCE` = Présente et valide
- [ ] `OPENAI_API_KEY` = Présente et valide
- [ ] `EMAIL_FROM` = Présente (ex: `noreply@avisprofr.com`)
- [ ] `EMAIL_DOMAIN` = Présente (ex: `avisprofr.com`)

### Variables optionnelles

- [ ] `RESEND_API_KEY` = Présente si vous utilisez Resend
- [ ] `STRIPE_WEBHOOK_SECRET` = Présente si vous utilisez les webhooks Stripe
- [ ] `GOOGLE_CLIENT_ID` = Présente si vous utilisez Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` = Présente si vous utilisez Google OAuth
- [ ] `GOOGLE_REDIRECT_URI` = `https://avisprofr.com/api/auth/gmail/callback` (HTTPS uniquement)
- [ ] `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` = `https://avisprofr.com/api/auth/gmail/callback` (HTTPS uniquement)

---

## 🚨 Problèmes courants

### Variable `NEXT_PUBLIC_APP_URL` en HTTP

**Symptôme :** Le site apparaît comme "non sécurisé" dans le navigateur

**Solution :**
1. Allez sur Netlify Dashboard → Site settings → Environment variables
2. Modifiez `NEXT_PUBLIC_APP_URL`
3. Changez `http://avisprofr.com` en `https://avisprofr.com`
4. Redéployez le site

### Variable `NEXT_PUBLIC_SUPABASE_URL` en HTTP

**Symptôme :** Erreurs de connexion à Supabase, warnings de contenu mixte

**Solution :**
1. Allez sur Netlify Dashboard → Site settings → Environment variables
2. Modifiez `NEXT_PUBLIC_SUPABASE_URL`
3. Assurez-vous que la valeur commence par `https://`
4. Redéployez le site

### Variable manquante

**Symptôme :** Erreur "Variable is not set" dans les logs

**Solution :**
1. Allez sur Netlify Dashboard → Site settings → Environment variables
2. Ajoutez la variable manquante
3. Redéployez le site

---

## 📝 Actions à faire maintenant

1. **Vérifier `NEXT_PUBLIC_APP_URL` :**
   - Allez sur : https://app.netlify.com/projects/avisprofr-app/configuration/env
   - Vérifiez que la valeur est `https://avisprofr.com`
   - Si ce n'est pas le cas, modifiez-la et redéployez

2. **Vérifier `NEXT_PUBLIC_SUPABASE_URL` :**
   - Vérifiez que la valeur commence par `https://`
   - Si ce n'est pas le cas, modifiez-la et redéployez

3. **Vérifier les autres URLs :**
   - Si vous utilisez Google OAuth, vérifiez que `GOOGLE_REDIRECT_URI` est en HTTPS
   - Vérifiez toutes les autres variables contenant des URLs

4. **Redéployer après modifications :**
   ```bash
   npx netlify-cli deploy --build --prod
   ```

---

## 🔗 Liens utiles

- **Netlify Dashboard - Variables :** https://app.netlify.com/projects/avisprofr-app/configuration/env
- **Netlify Dashboard - Deploys :** https://app.netlify.com/projects/avisprofr-app/deploys
- **Netlify Dashboard - Logs :** https://app.netlify.com/projects/avisprofr-app/logs/functions

---

## ✅ Résultat attendu

Après vérification et correction :

- ✅ Toutes les variables sont présentes
- ✅ Toutes les URLs sont en HTTPS
- ✅ Aucune variable en HTTP
- ✅ Le site fonctionne correctement
- ✅ Aucun warning de sécurité dans le navigateur

