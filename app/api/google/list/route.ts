import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route pour récupérer la liste des profils Google Business de l'utilisateur
 * Sécurisée : ne retourne que les profils de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer tous les profils Google Business de l'utilisateur
    // RLS garantit déjà l'isolation, mais on double-vérifie côté serveur
    const { data: googleProfiles, error } = await supabaseAdmin
      .from("google_business_profiles")
      .select(`
        id,
        google_place_id,
        nom_etablissement,
        categorie_principale,
        ville,
        note_moyenne,
        nombre_avis,
        photo_principale,
        url_fiche,
        derniere_sync_at,
        prochaine_sync_at,
        sync_en_cours,
        derniere_erreur,
        business_profile_id,
        business_profiles (
          id,
          nom_etablissement,
          ville
        )
      `)
      .eq("user_id", user.id)
      .order("derniere_sync_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching Google profiles:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des profils" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profiles: googleProfiles || [],
    });
  } catch (error: any) {
    console.error("Google list error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

