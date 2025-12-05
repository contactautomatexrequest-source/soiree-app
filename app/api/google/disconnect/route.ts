import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route pour déconnecter Google Business Profile
 * Supprime les tokens et le profil Google de l'utilisateur
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { placeId } = body;

    // Construire la requête de suppression
    let query = supabaseAdmin
      .from("google_business_profiles")
      .delete()
      .eq("user_id", user.id);

    // Si un placeId est fourni, supprimer uniquement ce profil
    if (placeId) {
      query = query.eq("google_place_id", placeId);
    }

    const { error } = await query;

    if (error) {
      console.error("Error disconnecting Google:", error);
      return NextResponse.json(
        { error: "Erreur lors de la déconnexion" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google Business Profile déconnecté",
    });
  } catch (error: any) {
    console.error("Google disconnect error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

