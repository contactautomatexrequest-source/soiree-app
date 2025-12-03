# Checklist de tests - Sécurité Multi-Clients AvisPro

Cette checklist permet de vérifier que l'isolation des données entre clients est garantie.

## Prérequis

1. Avoir accès à Supabase (SQL Editor)
2. Avoir accès à l'interface AvisPro
3. Avoir deux comptes de test (Compte A et Compte B)
4. Avoir accès à SimpleLogin ou un moyen de simuler des emails

---

## Test 1 : Isolation des établissements

### Étapes

1. **Créer Compte A**
   - S'inscrire avec email `test-a@example.com`
   - Créer un établissement "Restaurant A" (Paris)
   - Noter l'ID de l'établissement dans Supabase

2. **Créer Compte B**
   - S'inscrire avec email `test-b@example.com`
   - Créer un établissement "Salon B" (Lyon)
   - Noter l'ID de l'établissement dans Supabase

3. **Vérifier dans Supabase**
   ```sql
   -- Vérifier que chaque établissement a un user_id différent
   SELECT id, nom_etablissement, user_id 
   FROM business_profiles 
   WHERE nom_etablissement IN ('Restaurant A', 'Salon B');
   ```
   ✅ **Résultat attendu** : Deux lignes avec des `user_id` différents

4. **Vérifier dans l'interface**
   - Se connecter avec Compte A
   - Aller sur "Dashboard" ou "Connexion Google"
   - ✅ **Résultat attendu** : Seul "Restaurant A" est visible
   - Se connecter avec Compte B
   - ✅ **Résultat attendu** : Seul "Salon B" est visible

---

## Test 2 : Isolation des avis via alias email

### Étapes

1. **Configurer les alias dans Supabase**
   ```sql
   -- Pour Compte A (Restaurant A)
   UPDATE business_profiles 
   SET incoming_alias = 'restaurant-a-123' 
   WHERE nom_etablissement = 'Restaurant A';
   
   -- Pour Compte B (Salon B)
   UPDATE business_profiles 
   SET incoming_alias = 'salon-b-456' 
   WHERE nom_etablissement = 'Salon B';
   ```

2. **Simuler un email pour Compte A**
   - Envoyer un email à `avis+restaurant-a-123@avisprofr.com`
   - Le webhook `/api/email/webhook` doit traiter cet email
   - Vérifier dans Supabase :
     ```sql
     SELECT r.*, bp.nom_etablissement, bp.user_id
     FROM reviews r
     JOIN business_profiles bp ON r.business_id = bp.id
     WHERE bp.incoming_alias = 'restaurant-a-123';
     ```
   - ✅ **Résultat attendu** : Un avis créé avec le `user_id` du Compte A

3. **Simuler un email pour Compte B**
   - Envoyer un email à `avis+salon-b-456@avisprofr.com`
   - Vérifier dans Supabase :
     ```sql
     SELECT r.*, bp.nom_etablissement, bp.user_id
     FROM reviews r
     JOIN business_profiles bp ON r.business_id = bp.id
     WHERE bp.incoming_alias = 'salon-b-456';
     ```
   - ✅ **Résultat attendu** : Un avis créé avec le `user_id` du Compte B

4. **Vérifier l'isolation dans l'interface**
   - Se connecter avec Compte A
   - Aller sur "Historique"
   - ✅ **Résultat attendu** : Seul l'avis du Restaurant A est visible
   - Se connecter avec Compte B
   - Aller sur "Historique"
   - ✅ **Résultat attendu** : Seul l'avis du Salon B est visible

---

## Test 3 : Protection RLS (Row Level Security)

### Étapes

1. **Tester l'accès direct via Supabase client**
   - Se connecter avec Compte A
   - Ouvrir la console du navigateur
   - Exécuter :
     ```javascript
     const { createClient } = await import('@supabase/supabase-js');
     const supabase = createClient(
       'YOUR_SUPABASE_URL',
       'YOUR_SUPABASE_ANON_KEY'
     );
     
     // Essayer de récupérer tous les avis
     const { data } = await supabase
       .from('reviews')
       .select('*');
     ```
   - ✅ **Résultat attendu** : Seuls les avis du Compte A sont retournés

2. **Tester avec un business_id d'un autre utilisateur**
   - Récupérer l'ID d'un établissement du Compte B
   - Essayer de récupérer ses avis depuis Compte A :
     ```javascript
     const { data } = await supabase
       .from('reviews')
       .select('*')
       .eq('business_id', 'BUSINESS_ID_DU_COMPTE_B');
     ```
   - ✅ **Résultat attendu** : Aucun résultat (RLS bloque)

3. **Tester l'accès aux établissements**
   ```javascript
   const { data } = await supabase
     .from('business_profiles')
     .select('*');
   ```
   - ✅ **Résultat attendu** : Seuls les établissements du Compte A sont retournés

---

## Test 4 : Protection des routes API

### Étapes

1. **Tester `/api/generate-response`**
   - Se connecter avec Compte A
   - Récupérer un `business_id` du Compte B (via Supabase admin)
   - Essayer de générer une réponse pour cet établissement :
     ```bash
     curl -X POST https://avisprofr.com/api/generate-response \
       -H "Authorization: Bearer TOKEN_COMPTE_A" \
       -H "Content-Type: application/json" \
       -d '{
         "business_id": "BUSINESS_ID_COMPTE_B",
         "contenu_avis": "Test avis",
         "note": 5
       }'
     ```
   - ✅ **Résultat attendu** : Erreur 404 "Profil établissement introuvable"

2. **Tester `/api/billing/summary`**
   - Se connecter avec Compte A
   - Appeler l'API
   - ✅ **Résultat attendu** : Seules les métriques du Compte A sont retournées

---

## Test 5 : Mapping email incorrect

### Étapes

1. **Envoyer un email avec un alias inexistant**
   - Envoyer un email à `avis+alias-inexistant@avisprofr.com`
   - Vérifier les logs du webhook
   - ✅ **Résultat attendu** : 
     - Warning dans les logs : "No business profile found for alias: alias-inexistant"
     - Aucun avis créé dans la base
     - Réponse 200 avec message "Business not found"

2. **Envoyer un email sans alias**
   - Envoyer un email à `contact@avisprofr.com` (sans alias)
   - ✅ **Résultat attendu** :
     - Warning : "No alias found in email to: contact@avisprofr.com"
     - Aucun avis créé
     - Réponse 200 avec message "No alias found"

---

## Test 6 : Page "Connexion des avis Google"

### Étapes

1. **Accéder à la page**
   - Se connecter avec Compte A
   - Aller sur "Connexion Google" dans la sidebar
   - ✅ **Résultat attendu** : 
     - Seuls les établissements du Compte A sont affichés
     - Les alias sont affichés si configurés
     - Instructions de configuration sont claires

2. **Vérifier l'isolation**
   - Se connecter avec Compte B
   - Aller sur "Connexion Google"
   - ✅ **Résultat attendu** : 
     - Seuls les établissements du Compte B sont affichés
     - Aucun établissement du Compte A n'est visible

---

## Test 7 : Tentative d'accès direct via URL

### Étapes

1. **Tenter d'accéder à un avis d'un autre utilisateur**
   - Se connecter avec Compte A
   - Récupérer l'ID d'un avis du Compte B (via Supabase admin)
   - Essayer d'accéder directement via l'API :
     ```javascript
     const { data } = await supabase
       .from('reviews')
       .select('*')
       .eq('id', 'REVIEW_ID_COMPTE_B')
       .single();
     ```
   - ✅ **Résultat attendu** : `data` est `null` (RLS bloque)

---

## Résultats attendus globaux

✅ **Isolation complète** : Aucun client ne peut voir les données d'un autre
✅ **RLS fonctionnel** : Toutes les requêtes sont filtrées par `user_id`
✅ **Mapping email sécurisé** : Seuls les emails avec un alias valide créent des avis
✅ **Routes API protégées** : Toutes les routes vérifient l'appartenance des données
✅ **Interface isolée** : Chaque utilisateur ne voit que ses propres données

---

## En cas d'échec

Si un test échoue :

1. Vérifier que la migration `add_incoming_alias.sql` a été exécutée
2. Vérifier que les policies RLS sont actives dans Supabase
3. Vérifier les logs du webhook `/api/email/webhook`
4. Vérifier que tous les appels utilisent bien `user_id = auth.uid()`

---

## Notes importantes

- Les tests doivent être effectués dans un environnement de test, pas en production
- Ne jamais utiliser de vraies données clients pour les tests
- Toujours nettoyer les données de test après les tests

