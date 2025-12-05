# 🔍 Diagnostic : incoming_alias ne fonctionne pas

## ⚡ Vérification rapide

### 1. Vérifier dans Supabase que la colonne existe

Allez dans **Supabase Dashboard → SQL Editor** et exécutez :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name = 'incoming_alias';
```

**Résultat attendu :**
```
column_name      | data_type | is_nullable
-----------------|-----------|------------
incoming_alias   | text      | YES
```

**Si vous ne voyez rien :** La colonne n'existe pas, exécutez le SQL ci-dessous.

---

## 🚨 Solution : SQL à exécuter (si la colonne n'existe pas)

**Exécutez ce SQL dans Supabase SQL Editor :**

```sql
-- ÉTAPE 1 : Ajouter la colonne (sans UNIQUE d'abord)
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT;

-- ÉTAPE 2 : Vérifier qu'elle existe maintenant
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
AND column_name = 'incoming_alias';

-- ÉTAPE 3 : Ajouter la contrainte UNIQUE (après avoir ajouté la colonne)
-- Si vous avez des doublons, supprimez-les d'abord
ALTER TABLE business_profiles 
ADD CONSTRAINT unique_incoming_alias UNIQUE (incoming_alias);

-- ÉTAPE 4 : Créer l'index
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

-- ÉTAPE 5 : Générer les alias pour les établissements existants
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';

-- ÉTAPE 6 : Vérifier le résultat
SELECT id, incoming_alias, nom_etablissement 
FROM business_profiles 
LIMIT 5;
```

---

## 🔍 Diagnostic via API

Après le déploiement, appelez cette route pour diagnostiquer :

```
GET https://avisprofr.com/api/admin/diagnose-incoming-alias
```

Cette route va :
- ✅ Vérifier si la colonne existe
- ✅ Vérifier les permissions RLS
- ✅ Vérifier le schéma de la table
- ✅ Donner des solutions spécifiques

---

## ⚠️ Problèmes courants

### Problème 1 : "column does not exist"
**Cause :** La colonne n'a pas été créée
**Solution :** Exécutez le SQL ci-dessus, étape par étape

### Problème 2 : "duplicate key value violates unique constraint"
**Cause :** Il y a des doublons dans les alias
**Solution :** Exécutez ce SQL pour nettoyer :

```sql
-- Trouver les doublons
SELECT incoming_alias, COUNT(*) 
FROM business_profiles 
WHERE incoming_alias IS NOT NULL
GROUP BY incoming_alias 
HAVING COUNT(*) > 1;

-- Régénérer tous les alias (remplace les doublons)
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8);
```

### Problème 3 : Cache de l'application
**Cause :** L'application utilise un cache
**Solution :** Attendez 1-2 minutes après avoir exécuté le SQL, ou redéployez l'application

---

## ✅ Vérification finale

Une fois le SQL exécuté, vérifiez :

```sql
-- Vérifier que tous les établissements ont un alias
SELECT 
  COUNT(*) as total,
  COUNT(incoming_alias) as avec_alias,
  COUNT(*) - COUNT(incoming_alias) as sans_alias
FROM business_profiles;
```

**Résultat attendu :**
- `sans_alias` doit être `0`
- `avec_alias` doit être égal à `total`

---

## 📞 Si ça ne fonctionne toujours pas

1. **Vérifiez les logs Supabase** : Dashboard → Logs → Vérifiez les erreurs
2. **Appelez la route de diagnostic** : `/api/admin/diagnose-incoming-alias`
3. **Vérifiez les permissions** : Assurez-vous que RLS n'empêche pas la lecture

