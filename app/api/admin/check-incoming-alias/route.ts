import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route API pour vérifier l'état de la colonne incoming_alias
 * GET /api/admin/check-incoming-alias
 */
export async function GET(req: NextRequest) {
  try {
    const results: any = {
      columnExists: false,
      error: null,
      details: {},
      sqlToExecute: "",
    };

    // Essayer de lire la colonne
    try {
      const { data, error } = await supabaseAdmin
        .from("business_profiles")
        .select("id, incoming_alias")
        .limit(1);

      if (error) {
        if (error.message.includes("does not exist")) {
          results.columnExists = false;
          results.error = "La colonne incoming_alias n'existe pas";
          results.sqlToExecute = `
-- Exécutez ce SQL dans Supabase SQL Editor :

ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';
          `.trim();
        } else {
          results.error = error.message;
        }
      } else {
        results.columnExists = true;
        results.details = {
          message: "La colonne existe !",
          sampleData: data?.[0] || null,
        };

        // Compter les établissements avec/sans alias
        const { data: allProfiles, error: countError } = await supabaseAdmin
          .from("business_profiles")
          .select("id, incoming_alias");

        if (!countError && allProfiles) {
          const total = allProfiles.length;
          const withAlias = allProfiles.filter(p => p.incoming_alias).length;
          const withoutAlias = total - withAlias;

          results.details.total = total;
          results.details.withAlias = withAlias;
          results.details.withoutAlias = withoutAlias;

          if (withoutAlias > 0) {
            results.details.sqlToGenerateAliases = `
-- Générer les alias manquants :

UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';
            `.trim();
          }
        }
      }
    } catch (error: any) {
      results.error = error.message;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans check-incoming-alias:", error);
    return NextResponse.json(
      { error: error.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}

