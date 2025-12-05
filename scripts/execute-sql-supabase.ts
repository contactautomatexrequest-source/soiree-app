/**
 * Script pour exécuter les migrations SQL dans Supabase
 * 
 * Usage: 
 * 1. Configurer SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local
 * 2. pnpm tsx scripts/execute-sql-supabase.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSQL(sql: string) {
  try {
    // Supabase ne permet pas d'exécuter du SQL arbitraire via l'API client
    // Il faut utiliser l'API REST directement ou le SQL Editor dans le dashboard
    console.log("⚠️  Note: Supabase ne permet pas d'exécuter du SQL arbitraire via l'API client.");
    console.log("📝 Veuillez copier le SQL suivant et l'exécuter dans le Supabase SQL Editor :\n");
    console.log("=".repeat(80));
    console.log(sql);
    console.log("=".repeat(80));
    console.log("\n📋 Instructions:");
    console.log("1. Ouvrez https://supabase.com/dashboard");
    console.log("2. Sélectionnez votre projet");
    console.log("3. Allez dans 'SQL Editor'");
    console.log("4. Collez le SQL ci-dessus");
    console.log("5. Cliquez sur 'Run'");
    return true;
  } catch (error: any) {
    console.error("❌ Erreur lors de l'exécution:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Exécution des migrations SQL pour le système d'alias emails\n");

  // Lire le fichier SQL
  const sqlPath = join(process.cwd(), "supabase/migrations/EXECUTE_ALL_MIGRATIONS.sql");
  let sql: string;

  try {
    sql = readFileSync(sqlPath, "utf-8");
  } catch (error: any) {
    console.error(`❌ Erreur lors de la lecture du fichier SQL: ${error.message}`);
    process.exit(1);
  }

  // Afficher le SQL à exécuter
  await executeSQL(sql);

  console.log("\n✅ Le SQL est prêt à être exécuté dans Supabase SQL Editor");
}

main().catch(error => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});

