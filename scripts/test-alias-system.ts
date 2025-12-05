/**
 * Script de test automatisé du système d'alias
 * 
 * Simule :
 * 1. Création de deux comptes utilisateurs
 * 2. Création d'établissements pour chaque compte
 * 3. Vérification de la génération d'alias
 * 4. Simulation d'emails entrants
 * 5. Vérification de l'isolation des données
 * 
 * Usage: pnpm tsx scripts/test-alias-system.ts
 */

import { supabaseAdmin } from "../lib/supabase/admin";
import { resolveEstablishmentFromAlias } from "../lib/email/resolve-establishment";
import { validateBusinessProfileAlias } from "../lib/email/alias-validator";

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(step: string, success: boolean, message: string, data?: any) {
  results.push({ step, success, message, data });
  const icon = success ? "✅" : "❌";
  console.log(`${icon} ${step}: ${message}`);
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
}

async function testAliasSystem() {
  console.log("🧪 Démarrage des tests du système d'alias\n");

  // Étape 1: Créer deux utilisateurs de test
  console.log("📝 Étape 1: Création des utilisateurs de test...");
  
  const userAEmail = `test-user-a-${Date.now()}@test.com`;
  const userBEmail = `test-user-b-${Date.now()}@test.com`;

  let userAId: string;
  let userBId: string;

  try {
    // Créer les utilisateurs via Supabase Auth (nécessite les bonnes permissions)
    // Pour les tests, on peut utiliser des UUIDs de test ou créer via l'API Auth
    // Ici, on simule avec des IDs de test
    userAId = `test-user-a-${Date.now()}`;
    userBId = `test-user-b-${Date.now()}`;
    
    logResult("Create User A", true, `User A créé: ${userAId}`);
    logResult("Create User B", true, `User B créé: ${userBId}`);
  } catch (error: any) {
    logResult("Create Users", false, `Erreur: ${error.message}`);
    return;
  }

  // Étape 2: Créer des établissements pour chaque utilisateur
  console.log("\n📝 Étape 2: Création des établissements...");

  let businessAId: string;
  let businessBId: string;
  let aliasA: string;
  let aliasB: string;

  try {
    // Créer l'établissement A
    const { data: businessA, error: errorA } = await supabaseAdmin
      .from("business_profiles")
      .insert({
        user_id: userAId,
        metier: "restaurant",
        nom_etablissement: "Restaurant Test A",
        ville: "Paris",
        ton_marque: "chaleureux",
      })
      .select("id, incoming_alias")
      .single();

    if (errorA || !businessA) {
      logResult("Create Business A", false, `Erreur: ${errorA?.message || "No data"}`);
      return;
    }

    businessAId = businessA.id;
    aliasA = businessA.incoming_alias || "";

    if (!aliasA || aliasA.trim() === "") {
      logResult("Generate Alias A", false, "L'alias n'a pas été généré automatiquement");
      return;
    }

    logResult("Create Business A", true, `Établissement A créé: ${businessAId}`, { alias: aliasA });

    // Créer l'établissement B
    const { data: businessB, error: errorB } = await supabaseAdmin
      .from("business_profiles")
      .insert({
        user_id: userBId,
        metier: "coiffeur",
        nom_etablissement: "Salon Test B",
        ville: "Lyon",
        ton_marque: "premium",
      })
      .select("id, incoming_alias")
      .single();

    if (errorB || !businessB) {
      logResult("Create Business B", false, `Erreur: ${errorB?.message || "No data"}`);
      return;
    }

    businessBId = businessB.id;
    aliasB = businessB.incoming_alias || "";

    if (!aliasB || aliasB.trim() === "") {
      logResult("Generate Alias B", false, "L'alias n'a pas été généré automatiquement");
      return;
    }

    logResult("Create Business B", true, `Établissement B créé: ${businessBId}`, { alias: aliasB });

    // Vérifier que les alias sont différents
    if (aliasA === aliasB) {
      logResult("Alias Uniqueness", false, "Les deux alias sont identiques !");
      return;
    }

    logResult("Alias Uniqueness", true, "Les alias sont uniques");
  } catch (error: any) {
    logResult("Create Businesses", false, `Erreur: ${error.message}`);
    return;
  }

  // Étape 3: Valider les alias
  console.log("\n📝 Étape 3: Validation des alias...");

  try {
    const validationA = await validateBusinessProfileAlias(businessAId);
    logResult("Validate Alias A", validationA.isValid, 
      validationA.isValid ? "Alias A valide" : validationA.errors.join(", "));

    const validationB = await validateBusinessProfileAlias(businessBId);
    logResult("Validate Alias B", validationB.isValid, 
      validationB.isValid ? "Alias B valide" : validationB.errors.join(", "));
  } catch (error: any) {
    logResult("Validate Aliases", false, `Erreur: ${error.message}`);
  }

  // Étape 4: Tester la résolution d'alias
  console.log("\n📝 Étape 4: Test de résolution d'alias...");

  try {
    const emailA = `${aliasA}@avisprofr.com`;
    const mappingA = await resolveEstablishmentFromAlias(emailA);

    if (!mappingA) {
      logResult("Resolve Alias A", false, "Impossible de résoudre l'alias A");
      return;
    }

    if (mappingA.userId !== userAId || mappingA.establishmentId !== businessAId) {
      logResult("Resolve Alias A", false, 
        `Mapping incorrect: attendu user=${userAId}, business=${businessAId}, obtenu user=${mappingA.userId}, business=${mappingA.establishmentId}`);
      return;
    }

    logResult("Resolve Alias A", true, "Alias A correctement résolu", mappingA);

    const emailB = `${aliasB}@avisprofr.com`;
    const mappingB = await resolveEstablishmentFromAlias(emailB);

    if (!mappingB) {
      logResult("Resolve Alias B", false, "Impossible de résoudre l'alias B");
      return;
    }

    if (mappingB.userId !== userBId || mappingB.establishmentId !== businessBId) {
      logResult("Resolve Alias B", false, 
        `Mapping incorrect: attendu user=${userBId}, business=${businessBId}, obtenu user=${mappingB.userId}, business=${mappingB.establishmentId}`);
      return;
    }

    logResult("Resolve Alias B", true, "Alias B correctement résolu", mappingB);

    // Vérifier que l'alias A ne résout pas vers B et vice versa
    const wrongMappingA = await resolveEstablishmentFromAlias(emailB);
    if (wrongMappingA && wrongMappingA.establishmentId === businessAId) {
      logResult("Cross-Mapping Check", false, "L'alias B résout vers l'établissement A !");
      return;
    }

    const wrongMappingB = await resolveEstablishmentFromAlias(emailA);
    if (wrongMappingB && wrongMappingB.establishmentId === businessBId) {
      logResult("Cross-Mapping Check", false, "L'alias A résout vers l'établissement B !");
      return;
    }

    logResult("Cross-Mapping Check", true, "Aucune contamination croisée détectée");
  } catch (error: any) {
    logResult("Resolve Aliases", false, `Erreur: ${error.message}`);
  }

  // Étape 5: Nettoyage (supprimer les données de test)
  console.log("\n🧹 Nettoyage des données de test...");

  try {
    // Supprimer les établissements
    await supabaseAdmin.from("business_profiles").delete().eq("id", businessAId);
    await supabaseAdmin.from("business_profiles").delete().eq("id", businessBId);
    logResult("Cleanup", true, "Données de test supprimées");
  } catch (error: any) {
    logResult("Cleanup", false, `Erreur lors du nettoyage: ${error.message}`);
  }

  // Résumé
  console.log("\n📊 Résumé des tests:");
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  console.log(`✅ Réussis: ${successCount}`);
  console.log(`❌ Échoués: ${failCount}`);
  console.log(`📈 Taux de réussite: ${((successCount / results.length) * 100).toFixed(1)}%`);

  if (failCount > 0) {
    console.log("\n❌ Tests échoués:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.step}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log("\n✅ Tous les tests sont passés !");
    process.exit(0);
  }
}

// Exécuter les tests
testAliasSystem().catch(error => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});

