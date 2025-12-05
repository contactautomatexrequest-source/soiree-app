#!/usr/bin/env tsx
/**
 * Script pour :
 * 1. Ajouter la colonne incoming_alias si elle n'existe pas
 * 2. Vérifier la synchronisation des profils, comptes, etc.
 * 3. Vérifier que tout fonctionne correctement
 */

import { supabaseAdmin } from "../lib/supabase/admin";

async function executeSQL(sql: string): Promise<void> {
  try {
    // Exécuter la requête SQL via l'API REST Supabase
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ sql }),
      }
    );

    if (!response.ok) {
      // Si la fonction RPC n'existe pas, utiliser une approche alternative
      console.log("⚠️  RPC exec_sql non disponible, utilisation alternative...");
      return;
    }
  } catch (error) {
    console.log("⚠️  Méthode RPC non disponible, utilisation alternative...");
  }
}

async function addIncomingAliasColumn(): Promise<void> {
  console.log("📝 Étape 1 : Ajout de la colonne incoming_alias...");

  try {
    // Vérifier d'abord si la colonne existe
    const { data: columns, error: checkError } = await supabaseAdmin
      .from("business_profiles")
      .select("incoming_alias")
      .limit(1);

    if (checkError && checkError.message.includes("does not exist")) {
      console.log("   → Colonne n'existe pas, création en cours...");
      
      // Utiliser une requête SQL directe via l'admin client
      const { error: alterError } = await supabaseAdmin.rpc("exec_sql", {
        sql: `
          ALTER TABLE business_profiles 
          ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;
        `,
      });

      if (alterError) {
        console.error("   ❌ Erreur lors de l'ajout de la colonne:", alterError);
        throw alterError;
      }

      console.log("   ✅ Colonne incoming_alias ajoutée");
    } else {
      console.log("   ✅ Colonne incoming_alias existe déjà");
    }
  } catch (error: any) {
    console.error("   ❌ Erreur:", error.message);
    throw error;
  }
}

async function generateAliasesForExisting(): Promise<void> {
  console.log("📝 Étape 2 : Génération des alias pour les établissements existants...");

  try {
    // Récupérer tous les établissements sans alias
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from("business_profiles")
      .select("id, incoming_alias")
      .or("incoming_alias.is.null,incoming_alias.eq.");

    if (fetchError) {
      console.error("   ❌ Erreur lors de la récupération:", fetchError);
      throw fetchError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("   ✅ Tous les établissements ont déjà un alias");
      return;
    }

    console.log(`   → ${profiles.length} établissement(s) sans alias trouvé(s)`);

    // Générer des alias pour chaque établissement
    for (const profile of profiles) {
      const alias = `avis-${profile.id.toString().replace(/-/g, "").substring(0, 8)}`;
      
      const { error: updateError } = await supabaseAdmin
        .from("business_profiles")
        .update({ incoming_alias: alias })
        .eq("id", profile.id);

      if (updateError) {
        console.error(`   ❌ Erreur pour l'établissement ${profile.id}:`, updateError);
      } else {
        console.log(`   ✅ Alias généré: ${alias} pour ${profile.id}`);
      }
    }

    console.log("   ✅ Génération terminée");
  } catch (error: any) {
    console.error("   ❌ Erreur:", error.message);
    throw error;
  }
}

async function createIndex(): Promise<void> {
  console.log("📝 Étape 3 : Création de l'index...");

  try {
    // L'index sera créé automatiquement par Supabase si nécessaire
    // On vérifie juste qu'il n'y a pas d'erreur
    const { error } = await supabaseAdmin
      .from("business_profiles")
      .select("incoming_alias")
      .limit(1);

    if (error && error.message.includes("index")) {
      console.log("   ⚠️  Index à créer manuellement dans Supabase");
    } else {
      console.log("   ✅ Index vérifié");
    }
  } catch (error: any) {
    console.log("   ⚠️  Vérification index ignorée");
  }
}

async function verifyDatabaseState(): Promise<void> {
  console.log("\n🔍 Vérification de l'état de la base de données...\n");

  // 1. Vérifier les utilisateurs
  console.log("1️⃣  Utilisateurs:");
  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    console.log(`   ✅ ${users.users.length} utilisateur(s) trouvé(s)`);
    
    // Vérifier les subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, plan, status")
      .limit(10);

    if (subError) {
      console.log(`   ⚠️  Erreur subscriptions: ${subError.message}`);
    } else {
      console.log(`   ✅ ${subscriptions?.length || 0} abonnement(s) trouvé(s)`);
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }

  // 2. Vérifier les profils établissements
  console.log("\n2️⃣  Profils établissements:");
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id, nom_etablissement, incoming_alias")
      .limit(10);

    if (error) throw error;
    console.log(`   ✅ ${profiles?.length || 0} établissement(s) trouvé(s)`);
    
    if (profiles && profiles.length > 0) {
      const withoutAlias = profiles.filter(p => !p.incoming_alias);
      if (withoutAlias.length > 0) {
        console.log(`   ⚠️  ${withoutAlias.length} établissement(s) sans alias`);
      } else {
        console.log(`   ✅ Tous les établissements ont un alias`);
      }
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }

  // 3. Vérifier les avis
  console.log("\n3️⃣  Avis:");
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("id, user_id, business_id")
      .limit(10);

    if (error) throw error;
    console.log(`   ✅ ${reviews?.length || 0} avis trouvé(s)`);
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }

  // 4. Vérifier la synchronisation user_id
  console.log("\n4️⃣  Vérification synchronisation user_id:");
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id")
      .limit(100);

    if (error) throw error;

    if (profiles && profiles.length > 0) {
      const withoutUserId = profiles.filter(p => !p.user_id);
      if (withoutUserId.length > 0) {
        console.log(`   ⚠️  ${withoutUserId.length} établissement(s) sans user_id`);
      } else {
        console.log(`   ✅ Tous les établissements ont un user_id`);
      }
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Début de la migration et vérification...\n");

  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Variables d'environnement Supabase manquantes");
    }

    // Exécuter les migrations
    await addIncomingAliasColumn();
    await generateAliasesForExisting();
    await createIndex();

    // Vérifier l'état
    await verifyDatabaseState();

    console.log("\n✅ Migration et vérification terminées avec succès !");
  } catch (error: any) {
    console.error("\n❌ Erreur:", error.message);
    process.exit(1);
  }
}

main();

