/**
 * Script pour exécuter les migrations SQL directement dans Supabase
 * Utilise l'API REST de Supabase pour exécuter le SQL
 * 
 * Usage: pnpm tsx scripts/execute-sql-direct.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local");
  process.exit(1);
}

async function executeSQL(sql: string) {
  try {
    // Utiliser l'API REST de Supabase pour exécuter le SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      // Si la fonction RPC n'existe pas, on affiche le SQL à exécuter manuellement
      if (response.status === 404) {
        console.log("⚠️  La fonction RPC n'existe pas. Voici le SQL à exécuter manuellement :\n");
        return false;
      }
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ SQL exécuté avec succès !");
    console.log("Résultat:", result);
    return true;
  } catch (error: any) {
    if (error.message.includes("404") || error.message.includes("RPC")) {
      return false;
    }
    throw error;
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

  // Essayer d'exécuter via l'API
  const success = await executeSQL(sql);

  if (!success) {
    // Si l'API ne fonctionne pas, afficher les instructions manuelles
    console.log("\n" + "=".repeat(80));
    console.log(sql);
    console.log("=".repeat(80));
    console.log("\n📋 Instructions pour exécuter manuellement :");
    console.log("1. Ouvrez https://supabase.com/dashboard");
    console.log("2. Sélectionnez votre projet AvisPro");
    console.log("3. Allez dans 'SQL Editor' (menu de gauche)");
    console.log("4. Cliquez sur 'New query'");
    console.log("5. Collez le SQL ci-dessus");
    console.log("6. Cliquez sur 'Run' (ou Cmd/Ctrl + Enter)");
    console.log("7. Vérifiez qu'il n'y a pas d'erreurs");
    console.log("\n✅ Une fois exécuté, tous les établissements auront un alias automatique !");
  }
}

main().catch(error => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});

