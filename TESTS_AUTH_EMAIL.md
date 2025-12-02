# Checklist de tests - Authentification Email Supabase

## ✅ Tests à effectuer manuellement

### Test 1 : Création de compte

**Actions :**
1. Allez sur https://avisprofr.com/sign-up
2. Remplissez le formulaire avec :
   - Email : `test@example.com` (utilisez un email valide que vous pouvez consulter)
   - Mot de passe : `test123456` (minimum 6 caractères)
3. Cliquez sur "Créer mon compte et générer une réponse"

**Résultat attendu :**
- ✅ Le formulaire disparaît
- ✅ Un message s'affiche : "Vérifie ton email pour continuer"
- ✅ L'email saisi est affiché dans le message
- ✅ Un message indique : "Nous avons envoyé un lien de confirmation à [email]"
- ✅ Des boutons "Renvoyer l'email" et "Utiliser un autre email" sont visibles
- ✅ L'utilisateur n'est **PAS** connecté automatiquement

**Si erreur :**
- Vérifiez le message d'erreur affiché (doit être en français)
- Vérifiez les logs Netlify : Functions → Logs
- Vérifiez les logs Supabase : Authentication → Logs

---

### Test 2 : Réception de l'email de confirmation

**Actions :**
1. Ouvrez votre boîte email (celle utilisée lors de l'inscription)
2. Vérifiez les spams si l'email n'apparaît pas dans la boîte de réception principale
3. Attendez 1-2 minutes si l'email n'arrive pas immédiatement

**Résultat attendu :**
- ✅ Un email de Supabase arrive dans les 2 minutes
- ✅ L'email contient un lien de confirmation
- ✅ Le lien pointe vers `https://avisprofr.com/auth/callback?...` (ou `www.avisprofr.com`)

**Si l'email n'arrive pas :**
- Vérifiez les spams
- Vérifiez les logs Supabase : Authentication → Logs → Cherchez "email sent"
- Vérifiez que "Enable email confirmations" est bien activé dans Supabase Dashboard

---

### Test 3 : Clic sur le lien de confirmation

**Actions :**
1. Cliquez sur le lien de confirmation dans l'email reçu
2. Attendez la redirection

**Résultat attendu :**
- ✅ Vous êtes redirigé vers `https://avisprofr.com/sign-in?account_created=true`
- ✅ Un message vert s'affiche : "Compte créé avec succès !"
- ✅ Le message indique : "Ton email a été vérifié. Tu peux maintenant te connecter..."
- ✅ L'utilisateur n'est **PAS** connecté automatiquement (doit se connecter manuellement)

**Si erreur :**
- Si vous voyez "Lien de confirmation invalide ou expiré" :
  - Le lien a peut-être expiré (généralement valide 24h)
  - Utilisez le bouton "Renvoyer l'email" sur la page sign-up
- Si vous voyez "Cet email est déjà confirmé" :
  - C'est normal si vous avez déjà cliqué sur le lien
  - Vous pouvez directement vous connecter

---

### Test 4 : Connexion après confirmation

**Actions :**
1. Sur la page `/sign-in` (avec ou sans le message de succès)
2. Entrez l'email et le mot de passe utilisés lors de l'inscription
3. Cliquez sur "Accéder à mon dashboard"

**Résultat attendu :**
- ✅ Vous êtes redirigé vers `/app/valider`
- ✅ Vous êtes connecté et pouvez accéder au dashboard
- ✅ Le message "Compte créé avec succès" peut être fermé

**Si erreur :**
- Si vous voyez "Email ou mot de passe incorrect" :
  - Vérifiez que vous utilisez les bons identifiants
  - Vérifiez que l'email est bien confirmé (voir Test 3)
- Si vous voyez "Ton email n'a pas encore été confirmé" :
  - L'email n'a pas été confirmé, retournez à Test 2 et Test 3
  - Utilisez "Renvoyer l'email" si nécessaire

---

### Test 5 : Accès aux pages protégées

**Actions :**
1. Une fois connecté, testez l'accès aux pages suivantes :
   - `/app/valider`
   - `/app/historique`
   - `/app/profil`
   - `/app/facturation`
   - `/app/gestion` (si plan payant)

**Résultat attendu :**
- ✅ Toutes les pages `/app/*` sont accessibles
- ✅ Le sidebar affiche votre plan (Free, Pro, Business, etc.)
- ✅ Aucune redirection vers `/sign-in`

---

### Test 6 : Protection des routes (utilisateur non connecté)

**Actions :**
1. Déconnectez-vous (bouton "Déconnexion" dans le sidebar)
2. Essayez d'accéder directement à : `https://avisprofr.com/app/valider`
3. Essayez d'accéder à : `https://avisprofr.com/app/historique`

**Résultat attendu :**
- ✅ Vous êtes automatiquement redirigé vers `/sign-in`
- ✅ Vous ne pouvez pas accéder aux pages `/app/*` sans être connecté

---

### Test 7 : Cas d'erreur - Email déjà utilisé

**Actions :**
1. Allez sur `/sign-up`
2. Essayez de créer un compte avec un email déjà utilisé (celui du Test 1)

**Résultat attendu :**
- ✅ Un message d'erreur s'affiche : "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe."
- ✅ Le message est en français et clair

---

### Test 8 : Cas d'erreur - Mot de passe trop court

**Actions :**
1. Allez sur `/sign-up`
2. Entrez un email valide
3. Entrez un mot de passe de moins de 6 caractères (ex: `test`)
4. Cliquez sur "Créer mon compte"

**Résultat attendu :**
- ✅ Le navigateur bloque la soumission (validation HTML)
- ✅ OU un message d'erreur : "Le mot de passe doit contenir au moins 6 caractères."

---

### Test 9 : Cas d'erreur - Lien de confirmation expiré

**Actions :**
1. Créez un compte avec un email de test
2. Attendez 25 heures (ou utilisez un lien très ancien si vous en avez un)
3. Cliquez sur le lien de confirmation

**Résultat attendu :**
- ✅ Vous êtes redirigé vers `/sign-in`
- ✅ Un message d'erreur s'affiche : "Le lien de confirmation a expiré. Veuillez demander un nouveau lien."
- ✅ Le message est en français et clair

---

### Test 10 : Renvoyer l'email de confirmation

**Actions :**
1. Allez sur `/sign-up`
2. Créez un compte
3. Sur la page "Vérifie ton email", cliquez sur "Renvoyer l'email"

**Résultat attendu :**
- ✅ Un message de confirmation s'affiche : "Email de confirmation renvoyé ! Vérifie ta boîte de réception."
- ✅ Un nouvel email arrive dans votre boîte (peut prendre 1-2 minutes)
- ✅ Le nouveau lien fonctionne normalement

**Si erreur :**
- Si vous voyez "Trop de tentatives" :
  - Attendez quelques minutes avant de réessayer
  - C'est une protection anti-spam de Supabase

---

### Test 11 : Connexion avec email non confirmé (si possible)

**Actions :**
1. Créez un compte mais **NE CLIQUEZ PAS** sur le lien de confirmation
2. Allez sur `/sign-in`
3. Essayez de vous connecter avec cet email et mot de passe

**Résultat attendu :**
- ✅ Un message d'erreur s'affiche : "Ton email n'a pas encore été confirmé. Vérifie ta boîte de réception et clique sur le lien de confirmation."
- ✅ Le message est en français et clair
- ✅ L'utilisateur ne peut pas se connecter

**Note :** Ce test peut ne pas fonctionner si Supabase connecte automatiquement l'utilisateur même sans confirmation. Dans ce cas, c'est normal.

---

## 📊 Résumé des tests

**Tests critiques (doivent tous passer) :**
- ✅ Test 1 : Création de compte
- ✅ Test 2 : Réception de l'email
- ✅ Test 3 : Clic sur le lien
- ✅ Test 4 : Connexion après confirmation
- ✅ Test 5 : Accès aux pages protégées
- ✅ Test 6 : Protection des routes

**Tests de cas d'erreur (vérifient la robustesse) :**
- ✅ Test 7 : Email déjà utilisé
- ✅ Test 8 : Mot de passe trop court
- ✅ Test 9 : Lien expiré
- ✅ Test 10 : Renvoyer l'email
- ✅ Test 11 : Connexion sans confirmation

---

## 🚨 Problèmes fréquents et solutions

### L'email de confirmation n'arrive pas
1. Vérifiez les spams
2. Vérifiez les logs Supabase : Authentication → Logs
3. Vérifiez que "Enable email confirmations" est activé
4. Attendez 2-3 minutes (délai d'envoi possible)

### "Invalid redirect URL" après clic sur le lien
1. Vérifiez que toutes les URLs sont bien ajoutées dans Supabase Dashboard
2. Vérifiez que les URLs sont en HTTPS
3. Vérifiez que le wildcard `/**` est bien présent

### L'utilisateur est connecté automatiquement après confirmation
- C'est normal si Supabase le fait automatiquement
- Le code redirige quand même vers `/sign-in` pour afficher le message de succès

### Messages d'erreur en anglais
- Vérifiez que les modifications du code ont bien été déployées
- Vérifiez que vous utilisez la bonne version du site (pas de cache)

---

## ✅ Validation finale

Une fois tous les tests passés, l'authentification email est **opérationnelle** et prête pour la production.

