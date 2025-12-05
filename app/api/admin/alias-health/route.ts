import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateAllBusinessProfiles } from "@/lib/email/alias-validator";

/**
 * API Admin : Indicateurs de santé du système d'alias
 * 
 * Retourne :
 * - Nombre total d'alias actifs
 * - Nombre d'établissements sans alias
 * - Nombre d'alias dupliqués (ne devrait jamais arriver)
 * - Statistiques des emails reçus
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier que c'est un admin (à adapter selon votre système d'auth)
    // Pour l'instant, on retourne les stats sans vérification
    
    // 1. Statistiques des établissements
    const { data: allProfiles, error: profilesError } = await supabaseAdmin
      .from("business_profiles")
      .select("id, incoming_alias, user_id, nom_etablissement, created_at");

    if (profilesError) {
      throw profilesError;
    }

    const totalProfiles = allProfiles?.length || 0;
    const profilesWithAlias = allProfiles?.filter(p => p.incoming_alias && p.incoming_alias.trim() !== "").length || 0;
    const profilesWithoutAlias = totalProfiles - profilesWithAlias;

    // 2. Vérifier les doublons d'alias
    const aliasCounts: Record<string, number> = {};
    allProfiles?.forEach(profile => {
      if (profile.incoming_alias) {
        aliasCounts[profile.incoming_alias] = (aliasCounts[profile.incoming_alias] || 0) + 1;
      }
    });

    const duplicateAliases = Object.entries(aliasCounts)
      .filter(([_, count]) => count > 1)
      .map(([alias, count]) => ({ alias, count }));

    // 3. Statistiques des avis par source
    const { data: reviewsStats, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select("source, id");

    if (reviewsError) {
      console.error("Error fetching reviews stats:", reviewsError);
    }

    const reviewsBySource = {
      email_auto: reviewsStats?.filter(r => r.source === "email_auto").length || 0,
      gmail: reviewsStats?.filter(r => r.source === "gmail").length || 0,
      manuel: reviewsStats?.filter(r => r.source === "manuel").length || 0,
      total: reviewsStats?.length || 0,
    };

    // 4. Validation complète de tous les établissements
    let validationResult;
    try {
      validationResult = await validateAllBusinessProfiles();
    } catch (error) {
      console.error("Error validating all profiles:", error);
      validationResult = {
        total: totalProfiles,
        valid: 0,
        invalid: [],
      };
    }

    // 5. Statistiques des emails rejetés (si la table existe)
    let rejectedEmails = 0;
    try {
      const { count } = await supabaseAdmin
        .from("email_rejection_logs")
        .select("*", { count: "exact", head: true });
      rejectedEmails = count || 0;
    } catch (e) {
      // Table peut ne pas exister
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      businessProfiles: {
        total: totalProfiles,
        withAlias: profilesWithAlias,
        withoutAlias: profilesWithoutAlias,
        duplicateAliases: duplicateAliases.length,
        duplicateDetails: duplicateAliases,
      },
      validation: validationResult,
      reviews: reviewsBySource,
      rejectedEmails,
      health: {
        status: profilesWithoutAlias === 0 && duplicateAliases.length === 0 && validationResult.invalid.length === 0 ? "healthy" : "warning",
        issues: [
          ...(profilesWithoutAlias > 0 ? [`${profilesWithoutAlias} établissements sans alias`] : []),
          ...(duplicateAliases.length > 0 ? [`${duplicateAliases.length} alias dupliqués`] : []),
          ...(validationResult.invalid.length > 0 ? [`${validationResult.invalid.length} établissements invalides`] : []),
        ],
      },
    });
  } catch (error: any) {
    console.error("Error fetching alias health:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

