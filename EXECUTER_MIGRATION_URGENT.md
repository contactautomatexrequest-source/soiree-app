# 🚨 URGENT : Exécuter la migration SQL maintenant

## ⚡ Action immédiate requise

La colonne `incoming_alias` n'existe pas dans votre base de données Supabase. Vous devez l'exécuter **MAINTENANT** pour que le SaaS fonctionne.

## 📋 Étapes (2 minutes)

### 1. Ouvrir Supabase Dashboard
- Allez sur : **https://supabase.com/dashboard**
- Connectez-vous
- Sélectionnez votre projet **AvisPro**

### 2. Ouvrir SQL Editor
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Cliquez sur **"New query"** (ou `Cmd/Ctrl + N`)

### 3. Copier-coller ce SQL

```sql
-- Ajouter la colonne incoming_alias si elle n'existe pas
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

-- Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

-- Générer des alias pour les établissements existants qui n'en ont pas
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';
```

### 4. Exécuter
- Cliquez sur **"Run"** (ou appuyez sur `Cmd/Ctrl + Enter`)
- Vérifiez qu'il n'y a **pas d'erreurs** en rouge

### 5. Vérifier
- Vous devriez voir un message de succès
- La colonne `incoming_alias` est maintenant créée
- Tous les établissements existants ont maintenant un alias

## ✅ Après exécution

Une fois le SQL exécuté, votre SaaS fonctionnera correctement. La colonne `incoming_alias` sera disponible et tous les établissements auront un alias automatique.

## 🔍 Vérification

Pour vérifier que tout fonctionne, appelez :
```
GET https://avisprofr.com/api/admin/verify-production
```

Cette route vous dira si tout est correctement configuré.

---

## ⚠️ Important

**Cette migration est OBLIGATOIRE** pour que le système d'emails fonctionne. Sans cette colonne, les emails entrants ne pourront pas être mappés vers les établissements.

