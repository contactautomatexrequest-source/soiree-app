import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route API admin pour :
 * 1. Ajouter la colonne incoming_alias si elle n'existe pas
 * 2. Générer des alias pour les établissements existants
 * 3. Vérifier la synchronisation des profils, comptes, etc.
 * 
 * SECURITÉ : Cette route doit être protégée (à faire manuellement dans Netlify)
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification (à améliorer avec une clé secrète)
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
      verification: {},
    };

    // Étape 1 : Vérifier et ajouter la colonne incoming_alias
    try {
      // Tenter de lire la colonne pour vérifier si elle existe
      const { error: testError } = await supabaseAdmin
        .from("business_profiles")
        .select("incoming_alias")
        .limit(1);

      if (testError && testError.message.includes("does not exist")) {
        // La colonne n'existe pas, on doit l'ajouter via SQL
        // Note: Supabase Admin ne permet pas d'exécuter ALTER TABLE directement
        // Il faut le faire manuellement dans Supabase Dashboard
        results.steps.push({
          step: "add_column",
          status: "requires_manual",
          message: "La colonne incoming_alias n'existe pas. Exécutez cette SQL dans Supabase Dashboard:",
          sql: `
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS incoming_alias TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_business_profiles_incoming_alias 
ON business_profiles(incoming_alias) 
WHERE incoming_alias IS NOT NULL;
          `.trim(),
        });
      } else {
        results.steps.push({
          step: "add_column",
          status: "success",
          message: "Colonne incoming_alias existe déjà",
        });
      }
    } catch (error: any) {
      results.steps.push({
        step: "add_column",
        status: "error",
        message: error.message,
      });
    }

    // Étape 2 : Générer des alias pour les établissements existants
    try {
      const { data: profiles, error: fetchError } = await supabaseAdmin
        .from("business_profiles")
        .select("id, incoming_alias");

      if (fetchError) {
        results.steps.push({
          step: "generate_aliases",
          status: "error",
          message: fetchError.message,
        });
      } else {
        const withoutAlias = profiles?.filter(p => !p.incoming_alias) || [];
        
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
            message: `${updated} alias généré(s) sur ${withoutAlias.length} établissement(s)`,
            updated,
            total: withoutAlias.length,
          });
        } else {
          results.steps.push({
            step: "generate_aliases",
            status: "success",
            message: "Tous les établissements ont déjà un alias",
          });
        }
      }
    } catch (error: any) {
      results.steps.push({
        step: "generate_aliases",
        status: "error",
        message: error.message,
      });
    }

    // Étape 3 : Vérification de l'état de la base de données
    try {
      // Vérifier les utilisateurs
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      results.verification.users = {
        count: users?.users.length || 0,
        error: usersError?.message,
      };

      // Vérifier les subscriptions
      const { data: subscriptions, error: subError } = await supabaseAdmin
        .from("subscriptions")
        .select("id, user_id, plan, status");
      results.verification.subscriptions = {
        count: subscriptions?.length || 0,
        error: subError?.message,
      };

      // Vérifier les profils établissements
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("business_profiles")
        .select("id, user_id, nom_etablissement, incoming_alias");
      results.verification.business_profiles = {
        count: profiles?.length || 0,
        withoutAlias: profiles?.filter(p => !p.incoming_alias).length || 0,
        withoutUserId: profiles?.filter(p => !p.user_id).length || 0,
        error: profilesError?.message,
      };

      // Vérifier les avis
      const { data: reviews, error: reviewsError } = await supabaseAdmin
        .from("reviews")
        .select("id, user_id, business_id");
      results.verification.reviews = {
        count: reviews?.length || 0,
        error: reviewsError?.message,
      };

      results.steps.push({
        step: "verification",
        status: "success",
        message: "Vérification complète",
      });
    } catch (error: any) {
      results.steps.push({
        step: "verification",
        status: "error",
        message: error.message,
      });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error("Erreur dans fix-database:", error);
    return NextResponse.json(
      { error: error.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}

