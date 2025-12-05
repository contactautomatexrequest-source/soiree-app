import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route API de diagnostic complet pour incoming_alias
 * GET /api/admin/diagnose-incoming-alias
 * 
 * Diagnostique tous les problèmes possibles avec la colonne incoming_alias
 */
export async function GET(req: NextRequest) {
  try {
    const diagnosis: any = {
      timestamp: new Date().toISOString(),
      checks: [],
      errors: [],
      warnings: [],
      solutions: [],
    };

    // Check 1: Vérifier si la colonne existe via une requête directe
    diagnosis.checks.push({
      name: "Vérification existence colonne",
      status: "checking",
    });

    try {
      const { data, error } = await supabaseAdmin
        .from("business_profiles")
        .select("id, incoming_alias")
        .limit(1);

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("column") && error.message.includes("incoming_alias")) {
          diagnosis.checks[0].status = "failed";
          diagnosis.checks[0].error = error.message;
          diagnosis.errors.push("La colonne incoming_alias n'existe PAS dans la base de données");
          diagnosis.solutions.push({
            priority: "CRITICAL",
            action: "Exécuter ce SQL dans Supabase SQL Editor",
            sql: `
-- ÉTAPE 1 : Ajouter la colonne
ALTER TABLE business_profiles 
ADD COLUMN incoming_alias TEXT;

-- ÉTAPE 2 : Ajouter la contrainte UNIQUE (après avoir ajouté la colonne)
ALTER TABLE business_profiles 
ADD CONSTRAINT unique_incoming_alias UNIQUE (incoming_alias);

-- ÉTAPE 3 : Créer l'index
CREATE INDEX idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;

-- ÉTAPE 4 : Générer les alias pour les établissements existants
UPDATE business_profiles
SET incoming_alias = 'avis-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8)
WHERE incoming_alias IS NULL OR incoming_alias = '';
            `.trim(),
          });
        } else {
          diagnosis.checks[0].status = "error";
          diagnosis.checks[0].error = error.message;
          diagnosis.errors.push(`Erreur lors de la vérification: ${error.message}`);
        }
      } else {
        diagnosis.checks[0].status = "success";
        diagnosis.checks[0].message = "La colonne existe !";
        diagnosis.checks[0].sampleData = data?.[0] || null;
      }
    } catch (error: any) {
      diagnosis.checks[0].status = "error";
      diagnosis.checks[0].error = error.message;
      diagnosis.errors.push(`Exception: ${error.message}`);
    }

    // Check 2: Vérifier les permissions RLS
    if (diagnosis.checks[0].status === "success") {
      diagnosis.checks.push({
        name: "Vérification permissions RLS",
        status: "checking",
      });

      try {
        const { data: profiles, error: rlsError } = await supabaseAdmin
          .from("business_profiles")
          .select("id, incoming_alias, user_id")
          .limit(10);

        if (rlsError) {
          diagnosis.checks[1].status = "warning";
          diagnosis.checks[1].error = rlsError.message;
          diagnosis.warnings.push(`Problème RLS: ${rlsError.message}`);
        } else {
          diagnosis.checks[1].status = "success";
          diagnosis.checks[1].count = profiles?.length || 0;
        }
      } catch (error: any) {
        diagnosis.checks[1].status = "error";
        diagnosis.checks[1].error = error.message;
      }
    }

    // Check 3: Vérifier le schéma de la table
    diagnosis.checks.push({
      name: "Vérification schéma table",
      status: "checking",
    });

    try {
      // Essayer de lire toutes les colonnes de business_profiles
      const { data: testData, error: schemaError } = await supabaseAdmin
        .from("business_profiles")
        .select("*")
        .limit(1);

      if (schemaError) {
        diagnosis.checks[2].status = "error";
        diagnosis.checks[2].error = schemaError.message;
      } else {
        diagnosis.checks[2].status = "success";
        diagnosis.checks[2].columns = testData?.[0] ? Object.keys(testData[0]) : [];
        diagnosis.checks[2].hasIncomingAlias = testData?.[0] ? "incoming_alias" in testData[0] : false;
        
        if (!diagnosis.checks[2].hasIncomingAlias) {
          diagnosis.errors.push("La colonne incoming_alias n'est pas dans le schéma retourné");
        }
      }
    } catch (error: any) {
      diagnosis.checks[2].status = "error";
      diagnosis.checks[2].error = error.message;
    }

    // Résumé
    const hasErrors = diagnosis.errors.length > 0;
    const hasWarnings = diagnosis.warnings.length > 0;

    diagnosis.summary = {
      status: hasErrors ? "FAILED" : hasWarnings ? "WARNING" : "OK",
      errors: diagnosis.errors.length,
      warnings: diagnosis.warnings.length,
      message: hasErrors
        ? `❌ ${diagnosis.errors.length} erreur(s) détectée(s)`
        : hasWarnings
        ? `⚠️ ${diagnosis.warnings.length} avertissement(s)`
        : "✅ Tout semble correct",
    };

    return NextResponse.json(diagnosis, {
      status: hasErrors ? 500 : 200,
    });
  } catch (error: any) {
    console.error("Erreur dans diagnose-incoming-alias:", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur inconnue",
        summary: {
          status: "ERROR",
          message: "Erreur lors du diagnostic",
        },
      },
      { status: 500 }
    );
  }
}

