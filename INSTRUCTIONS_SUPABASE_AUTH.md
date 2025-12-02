# Instructions Supabase Dashboard - Configuration Email Auth

## 📋 Actions à effectuer dans le Dashboard Supabase

### Étape 1 : Accéder aux paramètres d'authentification

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet **AvisPro** (ou le nom de votre projet)
3. Dans le menu latéral gauche, cliquez sur **"Authentication"** (icône cadenas)
4. Cliquez sur l'onglet **"Settings"** (ou "Paramètres" en français)

---

### Étape 2 : Activer la confirmation d'email pour les inscriptions

1. Dans la section **"Email Auth"** :
   - ✅ Cochez la case **"Enable email signup"** (si ce n'est pas déjà fait)
   - ✅ Cochez la case **"Enable email confirmations"** (OBLIGATOIRE - doit être activé)
   
   **⚠️ IMPORTANT** : Sans cette option, les utilisateurs pourront se connecter sans vérifier leur email, ce qui pose des problèmes de sécurité.

2. **Optionnel** : Si vous souhaitez aussi demander une confirmation lors du changement d'email :
   - ✅ Cochez **"Enable email change confirmations"** (recommandé pour la sécurité)

---

### Étape 3 : Configurer l'URL du site

1. Dans la section **"Site URL"** :
   - Entrez : `https://avisprofr.com`
   - Cliquez sur **"Save"** (ou "Enregistrer")

   **Explication** : Cette URL est utilisée comme base pour tous les liens de confirmation d'email envoyés par Supabase.

---

### Étape 4 : Configurer les URLs de redirection autorisées

1. Dans la section **"Redirect URLs"** (ou "URLs de redirection") :
   - Vous verrez un champ **"Additional Redirect URLs"** (ou "URLs de redirection supplémentaires")
   - Cliquez sur **"Add URL"** (ou "Ajouter une URL") pour chaque URL ci-dessous

2. **Ajoutez ces URLs une par une** :

   ```
   https://avisprofr.com/**
   ```
   **Explication** : Autorise toutes les redirections vers votre domaine principal (wildcard pour toutes les pages).

   ```
   https://www.avisprofr.com/**
   ```
   **Explication** : Autorise toutes les redirections vers la version www de votre domaine.

   ```
   https://avisprofr.com/auth/callback
   ```
   **Explication** : URL de callback spécifique pour la confirmation d'email après inscription (route `/auth/callback`).

   ```
   https://www.avisprofr.com/auth/callback
   ```
   **Explication** : Version www de l'URL de callback pour la confirmation d'email.

3. Après avoir ajouté chaque URL, cliquez sur **"Save"** (ou "Enregistrer")

---

### Étape 5 : Vérifier le template d'email de confirmation (optionnel mais recommandé)

1. Dans le menu latéral, toujours sous **"Authentication"**, cliquez sur **"Email Templates"** (ou "Modèles d'email")
2. Sélectionnez le template **"Confirm signup"** (ou "Confirmer l'inscription")
3. Vérifiez que le lien de confirmation dans le template utilise bien :
   ```
   {{ .ConfirmationURL }}
   ```
   ou
   ```
   {{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup
   ```

   **Note** : Supabase génère automatiquement `{{ .ConfirmationURL }}` qui pointe vers votre Site URL + le token. Si vous utilisez un template personnalisé, assurez-vous que le lien pointe vers `/auth/callback`.

4. Si vous modifiez le template, cliquez sur **"Save"** (ou "Enregistrer")

---

### Étape 6 : Vérifier les paramètres de sécurité (optionnel)

1. Toujours dans **"Authentication" → "Settings"**
2. Vérifiez la section **"Security"** :
   - **"JWT expiry"** : La valeur par défaut (3600 secondes = 1 heure) est généralement suffisante
   - **"Refresh token rotation"** : Activé par défaut (recommandé)
   - **"Refresh token reuse detection"** : Activé par défaut (recommandé)

   **Note** : Vous n'avez pas besoin de modifier ces valeurs sauf si vous avez des besoins spécifiques.

---

### Étape 7 : Tester la configuration

1. Une fois toutes les configurations sauvegardées, testez en créant un compte de test :
   - Allez sur https://avisprofr.com/sign-up
   - Créez un compte avec un email valide
   - Vérifiez que vous recevez bien l'email de confirmation
   - Cliquez sur le lien dans l'email
   - Vérifiez que vous êtes bien redirigé vers `/sign-in` avec le message de succès

---

## ✅ Checklist de vérification

Avant de considérer la configuration comme terminée, vérifiez que :

- [ ] "Enable email confirmations" est **ACTIVÉ**
- [ ] "Site URL" est défini sur `https://avisprofr.com`
- [ ] Les 4 URLs de redirection sont bien ajoutées dans "Additional Redirect URLs"
- [ ] Le template "Confirm signup" utilise `{{ .ConfirmationURL }}` ou pointe vers `/auth/callback`
- [ ] Vous avez cliqué sur "Save" après chaque modification

---

## 🚨 Problèmes courants

### "Invalid redirect URL" après clic sur le lien de confirmation
→ Vérifiez que toutes les URLs de redirection sont bien ajoutées dans Supabase Dashboard

### Email de confirmation non reçu
→ Vérifiez les logs Supabase : **Authentication → Logs** pour voir si l'email a été envoyé
→ Vérifiez aussi les spams de votre boîte email

### "Email already confirmed" mais l'utilisateur ne peut pas se connecter
→ Vérifiez que le middleware vérifie bien l'état de confirmation de l'email (sera géré dans le code)

---

## 📝 Notes importantes

- ⚠️ **Ne désactivez JAMAIS "Enable email confirmations"** en production sans raison valable
- ⚠️ Les URLs de redirection doivent être en **HTTPS** en production
- ⚠️ Le wildcard `/**` autorise toutes les sous-pages, ce qui est pratique mais vérifiez que c'est bien ce que vous voulez

