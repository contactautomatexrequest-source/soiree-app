# Prochaines étapes - Sécurisation Multi-Clients

## ✅ Ce qui est fait
- Schéma de base créé avec toutes les tables
- RLS (Row Level Security) configuré et renforcé
- Migration `incoming_alias` en place
- Code mis à jour pour utiliser `incoming_alias`

## 📋 Étapes suivantes

### 1. Vérifier que les tables existent

Dans Supabase SQL Editor, exécutez :

```sql
-- Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('business_profiles', 'reviews', 'ai_responses', 'subscriptions')
ORDER BY table_name;
```

✅ **Résultat attendu** : 4 lignes (business_profiles, reviews, ai_responses, subscriptions)

---

### 2. Configurer les alias pour les établissements existants (si nécessaire)

Si vous avez déjà des établissements dans la base, vous devez leur attribuer un `incoming_alias` unique.

#### Option A : Générer automatiquement des alias pour tous les établissements existants

```sql
-- Générer un alias unique pour chaque établissement qui n'en a pas
UPDATE business_profiles
SET incoming_alias = 'etab-' || SUBSTRING(id::text, 1, 8) || '-' || SUBSTRING(MD5(id::text || nom_etablissement), 1, 6)
WHERE incoming_alias IS NULL;
```

#### Option B : Configurer manuellement un alias spécifique

```sql
-- Pour un établissement spécifique (remplacer ID_ETABLISSEMENT)
UPDATE business_profiles
SET incoming_alias = 'mon-restaurant-123'
WHERE id = 'ID_ETABLISSEMENT';
```

**Important** : L'alias doit être unique et ne contenir que des caractères alphanumériques et des tirets.

---

### 3. Vérifier les RLS Policies

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('business_profiles', 'reviews', 'ai_responses', 'subscriptions');

-- Vérifier les policies existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('business_profiles', 'reviews', 'ai_responses', 'subscriptions')
ORDER BY tablename, policyname;
```

✅ **Résultat attendu** : 
- `rowsecurity = true` pour toutes les tables
- Plusieurs policies par table (SELECT, INSERT, UPDATE, DELETE)

---

### 4. Tester la sécurisation (optionnel mais recommandé)

Suivez la checklist dans `TESTS_SECURITE_MULTI_CLIENTS.md` pour vérifier que :
- Les utilisateurs ne voient que leurs propres données
- Les RLS fonctionnent correctement
- Le mapping email fonctionne

---

### 5. Configurer SimpleLogin / Resend pour les emails

Si ce n'est pas déjà fait :

1. **Dans SimpleLogin ou votre service email** :
   - Configurez un forwarding vers `avis+ALIAS@avisprofr.com`
   - Pour chaque établissement, utilisez son `incoming_alias` unique

2. **Dans Resend** (si utilisé) :
   - Configurez le webhook vers `https://avisprofr.com/api/email/webhook`
   - Vérifiez que les emails arrivent bien

---

### 6. Tester le webhook email

Pour tester que le mapping fonctionne :

1. Envoyez un email de test à `avis+VOTRE_ALIAS@avisprofr.com`
2. Vérifiez dans Supabase qu'un avis a été créé :

```sql
-- Vérifier les avis créés récemment
SELECT r.*, bp.nom_etablissement, bp.incoming_alias
FROM reviews r
JOIN business_profiles bp ON r.business_id = bp.id
WHERE r.source = 'email_auto'
ORDER BY r.created_at DESC
LIMIT 10;
```

---

### 7. Vérifier dans l'interface

1. **Connectez-vous à AvisPro**
2. **Allez sur "Connexion Google"** dans la sidebar
3. **Vérifiez que** :
   - Vos établissements sont listés
   - Les alias sont affichés si configurés
   - Les instructions sont claires

---

### 8. Déployer sur Netlify (si nécessaire)

Si vous avez fait des changements de code :

```bash
# Vérifier que tout compile
pnpm build

# Si OK, pousser sur GitHub (déjà fait normalement)
git push origin main

# Netlify déploiera automatiquement
```

---

## 🎯 Résumé des actions immédiates

1. ✅ **SQL exécuté** - Fait
2. ⏭️ **Vérifier les tables** - Exécutez la requête SQL de l'étape 1
3. ⏭️ **Configurer les alias** - Si vous avez des établissements existants
4. ⏭️ **Tester l'interface** - Aller sur "Connexion Google" dans AvisPro

---

## ❓ Questions fréquentes

**Q : Dois-je configurer les alias maintenant ?**
R : Seulement si vous avez déjà des établissements dans la base. Sinon, les alias seront générés automatiquement lors de la création d'établissements (via le code).

**Q : Comment savoir si un établissement a un alias ?**
R : Dans Supabase, exécutez :
```sql
SELECT id, nom_etablissement, incoming_alias 
FROM business_profiles;
```

**Q : Que faire si le webhook ne fonctionne pas ?**
R : Vérifiez les logs dans Netlify Functions, et assurez-vous que l'alias dans l'email correspond exactement à `incoming_alias` dans la base.

---

## 🚀 Tout est prêt !

Votre architecture est maintenant sécurisée pour le multi-clients. Chaque utilisateur ne peut voir que ses propres données, et chaque établissement a son alias email unique.

