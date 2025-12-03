# Configuration des Redirects Supabase - AvisPro

## 🎯 Objectif

Configurer les URLs de redirection dans Supabase Dashboard pour que l'authentification email fonctionne correctement.

---

## 📋 Instructions étape par étape

### Étape 1 : Accéder aux paramètres d'authentification

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet **AvisPro** (ou le nom de votre projet)
3. Dans le menu latéral gauche, cliquez sur **"Authentication"** (icône cadenas 🔒)
4. Cliquez sur l'onglet **"URL Configuration"** (ou "Configuration des URLs" en français)

---

### Étape 2 : Configurer la Site URL

1. Dans le champ **"Site URL"** :
   - Entrez exactement : `https://avisprofr.com`
   - Cliquez sur **"Save"** (ou "Enregistrer")

   **⚠️ IMPORTANT :** Cette URL doit être en HTTPS, jamais en HTTP.

---

### Étape 3 : Ajouter les Redirect URLs

1. Dans la section **"Redirect URLs"** (ou "URLs de redirection") :
   - Vous verrez un champ **"Redirect URLs"** avec une liste
   - Cliquez sur **"Add URL"** (ou "Ajouter une URL") pour chaque URL ci-dessous

2. **Ajoutez ces URLs une par une** (cliquez sur "Add URL" pour chaque ligne) :

   ```
   https://avisprofr.com/**
   ```
   **Explication :** Autorise toutes les redirections vers votre domaine principal (wildcard pour toutes les pages).

   ```
   https://www.avisprofr.com/**
   ```
   **Explication :** Autorise toutes les redirections vers la version www de votre domaine.

   ```
   https://avisprofr.com/auth/callback
   ```
   **Explication :** URL de callback spécifique pour la confirmation d'email après inscription (route `/auth/callback`).

   ```
   https://www.avisprofr.com/auth/callback
   ```
   **Explication :** Version www de l'URL de callback pour la confirmation d'email.

3. Après avoir ajouté chaque URL, cliquez sur **"Save"** (ou "Enregistrer")

---

### Étape 4 : Vérifier la configuration

Une fois toutes les URLs ajoutées, vous devriez voir dans la liste :

- ✅ `https://avisprofr.com/**`
- ✅ `https://www.avisprofr.com/**`
- ✅ `https://avisprofr.com/auth/callback`
- ✅ `https://www.avisprofr.com/auth/callback`

---

## 📸 Aperçu de l'interface Supabase

Dans Supabase Dashboard → Authentication → URL Configuration, vous devriez voir :

```
Site URL:
https://avisprofr.com

Redirect URLs:
https://avisprofr.com/**
https://www.avisprofr.com/**
https://avisprofr.com/auth/callback
https://www.avisprofr.com/auth/callback
```

---

## ⚠️ Points importants

1. **Toutes les URLs doivent être en HTTPS** : Jamais en HTTP
2. **Le wildcard `/**` est important** : Il autorise toutes les sous-pages
3. **Sauvegardez après chaque ajout** : Cliquez sur "Save" après avoir ajouté chaque URL
4. **Vérifiez l'orthographe** : `avisprofr.com` (pas `avis-pro.fr` ou autre)

---

## 🧪 Test après configuration

1. Allez sur : https://avisprofr.com/sign-up
2. Créez un compte avec un email valide
3. Vérifiez que vous recevez l'email de confirmation
4. Cliquez sur le lien dans l'email
5. Vous devriez être redirigé vers : `https://avisprofr.com/sign-in?account_created=true`

**Si vous voyez une erreur "Invalid redirect URL" :**
- Vérifiez que toutes les URLs sont bien ajoutées dans Supabase
- Vérifiez que les URLs sont exactement comme indiqué ci-dessus
- Vérifiez que vous avez cliqué sur "Save" après chaque ajout

---

## 🔗 Liens utiles

- **Supabase Dashboard :** https://supabase.com/dashboard
- **Documentation Supabase Auth :** https://supabase.com/docs/guides/auth

---

## ✅ Checklist de vérification

Avant de considérer la configuration comme terminée, vérifiez que :

- [ ] "Site URL" est défini sur `https://avisprofr.com`
- [ ] Les 4 URLs de redirection sont bien ajoutées dans "Redirect URLs"
- [ ] Toutes les URLs sont en HTTPS
- [ ] Vous avez cliqué sur "Save" après chaque modification
- [ ] Le test de création de compte fonctionne

---

## 🚨 Problèmes courants

### "Invalid redirect URL" après clic sur le lien de confirmation
→ Vérifiez que toutes les URLs de redirection sont bien ajoutées dans Supabase Dashboard
→ Vérifiez que les URLs sont exactement comme indiqué (pas d'espace, pas de typo)

### Email de confirmation non reçu
→ Vérifiez les logs Supabase : **Authentication → Logs** pour voir si l'email a été envoyé
→ Vérifiez aussi les spams de votre boîte email

### Redirection vers une page d'erreur
→ Vérifiez que la route `/auth/callback` existe bien dans votre projet (elle existe déjà)
→ Vérifiez que le Site URL est correct

