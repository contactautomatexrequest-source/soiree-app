import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route API pour exécuter la migration SQL automatiquement
 * POST /api/admin/execute-migration
 * 
 * Cette route exécute le SQL nécessaire pour créer la colonne incoming_alias
 * en utilisant une fonction SQL dans Supabase
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.ADMIN_SECRET_KEY;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const results: any = {
      steps: [],
      sql: "",
      instructions: [],
    };

    // SQL à exécuter
    const migrationSQL = `
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
    `.trim();

    results.sql = migrationSQL;

    // Essayer d'exécuter via une fonction RPC (si elle existe)
    try {
      // Créer d'abord la fonction si elle n'existe pas
      const createFunctionSQL = `
CREATE OR REPLACE FUNCTION add_incoming_alias_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ajouter la colonne si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'incoming_alias'
  ) THEN
    ALTER TABLE business_profiles 
    ADD COLUMN incoming_alias TEXT UNIQUE;
    
    CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
    ON business_profiles(incoming_alias) 
    WHERE incoming_alias IS NOT NULL;
  END IF;
  
  -- Générer des alias pour les établissements existants
  UPDATE business_profiles
  SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
  WHERE incoming_alias IS NULL OR incoming_alias = '';
END;
$$;
      `;

      // Exécuter la création de la fonction via l'API REST
      // Note: Supabase ne permet pas d'exécuter du SQL arbitraire via l'API REST
      // Il faut utiliser l'API Management ou exécuter manuellement
      
      results.steps.push({
        step: "info",
        status: "manual_required",
        message: "Supabase ne permet pas d'exécuter du SQL arbitraire via l'API REST. Vous devez exécuter le SQL manuellement dans Supabase Dashboard.",
      });

      results.instructions = [
        "1. Allez sur https://supabase.com/dashboard",
        "2. Sélectionnez votre projet",
        "3. Allez dans 'SQL Editor' (menu de gauche)",
        "4. Cliquez sur 'New query'",
        "5. Collez le SQL ci-dessous",
        "6. Cliquez sur 'Run' (ou Cmd/Ctrl + Enter)",
        "7. Vérifiez qu'il n'y a pas d'erreurs",
      ];

      // Vérifier si la colonne existe maintenant
      try {
        const { error: testError } = await supabaseAdmin
          .from("business_profiles")
          .select("incoming_alias")
          .limit(1);

        if (testError && testError.message.includes("does not exist")) {
          results.steps.push({
            step: "check_column",
            status: "missing",
            message: "La colonne incoming_alias n'existe toujours pas. Exécutez le SQL ci-dessous.",
          });
        } else {
          results.steps.push({
            step: "check_column",
            status: "exists",
            message: "La colonne incoming_alias existe !",
          });

          // Générer les alias manquants
          const { data: profiles, error: fetchError } = await supabaseAdmin
            .from("business_profiles")
            .select("id, incoming_alias");

          if (!fetchError && profiles) {
            const withoutAlias = profiles.filter(p => !p.incoming_alias);
            if (withoutAlias.length > 0) {
              let updated = 0;
              for (const profile of withoutAlias) {
                const alias = `avis-${profile.id.toString().replace(/-/g, "").substring(0, 8)}`;
                const { error: updateError } = await supabaseAdmin
                  .from("business_profiles")
                  .update({ incoming_alias: alias })
                  .eq("id", profile.id);

                if (!updateError) {
                  updated++;
                }
              }

              results.steps.push({
                step: "generate_aliases",
                status: "success",
                message: `${updated} alias généré(s)`,
                updated,
              });
            } else {
              results.steps.push({
                step: "generate_aliases",
                status: "success",
                message: "Tous les établissements ont déjà un alias",
              });
            }
          }
        }
      } catch (error: any) {
        results.steps.push({
          step: "check_column",
          status: "error",
          message: error.message,
        });
      }

    } catch (error: any) {
      results.steps.push({
        step: "execution",
        status: "error",
        message: error.message,
      });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans execute-migration:", error);
    return NextResponse.json(
      { error: error.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}

