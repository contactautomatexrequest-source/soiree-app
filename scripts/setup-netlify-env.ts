#!/usr/bin/env tsx
/**
 * Script pour configurer toutes les variables d'environnement Netlify
 * Usage: pnpm tsx scripts/setup-netlify-env.ts
 */

import { execSync } from "child_process";

interface EnvVar {
  key: string;
  description: string;
  required: boolean;
  example?: string;
}

const ENV_VARS: EnvVar[] = [
  // Supabase
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    description: "URL de votre projet Supabase (ex: https://xxxxx.supabase.co)",
    required: true,
    example: "https://xxxxx.supabase.co",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Clé publique Supabase (anon key)",
    required: true,
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    description: "Clé secrète Supabase (service_role key) - SECRET",
    required: true,
  },
  // Stripe
  {
    key: "STRIPE_SECRET_KEY",
    description: "Clé secrète Stripe (sk_live_... ou sk_test_...)",
    required: true,
    example: "sk_live_...",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    description: "Secret du webhook Stripe (whsec_...)",
    required: true,
    example: "whsec_...",
  },
  {
    key: "STRIPE_PRICE_ID_PRO",
    description: "Price ID Stripe pour le plan Pro",
    required: true,
    example: "price_xxx",
  },
  {
    key: "STRIPE_PRICE_ID_BUSINESS",
    description: "Price ID Stripe pour le plan Business",
    required: true,
    example: "price_xxx",
  },
  {
    key: "STRIPE_PRICE_ID_AGENCE",
    description: "Price ID Stripe pour le plan Agence",
    required: true,
    example: "price_xxx",
  },
  // OpenAI
  {
    key: "OPENAI_API_KEY",
    description: "Clé API OpenAI (sk-proj-...)",
    required: true,
    example: "sk-proj-...",
  },
  // Resend
  {
    key: "RESEND_API_KEY",
    description: "Clé API Resend (re_...)",
    required: true,
    example: "re_...",
  },
  {
    key: "EMAIL_FROM",
    description: "Email expéditeur (ex: noreply@avisprofr.com)",
    required: true,
    example: "noreply@avisprofr.com",
  },
  {
    key: "EMAIL_DOMAIN",
    description: "Domaine email (ex: avisprofr.com)",
    required: true,
    example: "avisprofr.com",
  },
  // Application
  {
    key: "NEXT_PUBLIC_APP_URL",
    description: "URL de l'application (doit être en HTTPS)",
    required: true,
    example: "https://avisprofr.com",
  },
  // Google OAuth (optionnel)
  {
    key: "GOOGLE_CLIENT_ID",
    description: "Google OAuth Client ID (optionnel)",
    required: false,
    example: "xxxxx.apps.googleusercontent.com",
  },
  {
    key: "GOOGLE_CLIENT_SECRET",
    description: "Google OAuth Client Secret (optionnel)",
    required: false,
  },
  {
    key: "GOOGLE_REDIRECT_URI",
    description: "Google OAuth Redirect URI (optionnel)",
    required: false,
    example: "https://avisprofr.com/api/auth/gmail/callback",
  },
  {
    key: "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
    description: "Google OAuth Redirect URI public (optionnel)",
    required: false,
    example: "https://avisprofr.com/api/auth/gmail/callback",
  },
];

function setNetlifyEnv(key: string, value: string, scope: string = "all") {
  try {
    console.log(`\n🔧 Configuration de ${key}...`);
    execSync(`npx netlify-cli env:set ${key} "${value}" --scope ${scope}`, {
      stdio: "inherit",
    });
    console.log(`✅ ${key} configuré avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la configuration de ${key}:`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Configuration des variables d'environnement Netlify\n");
  console.log("=" .repeat(60));
  console.log("Ce script va configurer toutes les variables nécessaires");
  console.log("Vous devrez fournir les valeurs pour chaque variable\n");
  console.log("=" .repeat(60));

  const values: Record<string, string> = {};

  // Parcourir toutes les variables
  for (const envVar of ENV_VARS) {
    if (!envVar.required) {
      const skip = process.argv.includes("--skip-optional");
      if (skip) {
        console.log(`\n⏭️  Variable optionnelle ${envVar.key} ignorée`);
        continue;
      }
    }

    console.log(`\n📝 ${envVar.key}`);
    console.log(`   Description: ${envVar.description}`);
    if (envVar.example) {
      console.log(`   Exemple: ${envVar.example}`);
    }
    
    // Vérifier si la valeur est déjà dans les arguments
    const argIndex = process.argv.indexOf(`--${envVar.key}`);
    if (argIndex !== -1 && process.argv[argIndex + 1]) {
      values[envVar.key] = process.argv[argIndex + 1];
      console.log(`   ✅ Valeur fournie via argument: ${values[envVar.key].substring(0, 20)}...`);
      continue;
    }

    // Demander la valeur (pour l'instant, on va utiliser un placeholder)
    // En production, on utiliserait readline pour demander interactivement
    if (envVar.required) {
      console.log(`   ⚠️  Valeur requise - à configurer manuellement`);
    } else {
      console.log(`   ℹ️  Variable optionnelle - peut être ignorée`);
    }
  }

  console.log("\n\n" + "=".repeat(60));
  console.log("📋 RÉSUMÉ");
  console.log("=".repeat(60));
  console.log("\nPour configurer les variables, utilisez une des méthodes suivantes:\n");
  console.log("1. Via l'interface Netlify:");
  console.log("   https://app.netlify.com/projects/avispro-app/configuration/env\n");
  console.log("2. Via la CLI Netlify (commande par commande):");
  for (const envVar of ENV_VARS) {
    if (envVar.required) {
      console.log(`   npx netlify-cli env:set ${envVar.key} "VOTRE_VALEUR"`);
    }
  }
  console.log("\n3. Via ce script avec arguments:");
  console.log("   pnpm tsx scripts/setup-netlify-env.ts --NEXT_PUBLIC_SUPABASE_URL=https://... --NEXT_PUBLIC_SUPABASE_ANON_KEY=...");
  console.log("\n" + "=".repeat(60));
}

main().catch(console.error);

