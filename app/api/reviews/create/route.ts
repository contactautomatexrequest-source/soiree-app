import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkManualReviewQuota } from "@/lib/review-quota";
import { z } from "zod";

const CreateReviewSchema = z.object({
  business_id: z.string().uuid(),
  contenu_avis: z.string().min(1, "Le contenu de l'avis est requis"),
  note: z.number().int().min(1).max(5).optional(),
  author_name: z.string().optional(),
});

/**
 * Route API pour créer un avis manuellement
 * POST /api/reviews/create
 * 
 * Tous les plans peuvent créer des avis manuellement
 * Plan free : limite de 5 avis manuels par mois
 * Plans payants : illimité
 */
export async function POST(req: NextRequest) {
  try {
    // Vérification authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Validation des données
    const body = await req.json();
    const validated = CreateReviewSchema.parse(body);

    // Vérifier que l'établissement appartient à l'utilisateur
    const { data: business, error: businessError } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id")
      .eq("id", validated.business_id)
      .eq("user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Établissement introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    // Vérifier le quota pour les avis manuels (plan free : 5 max)
    const quota = await checkManualReviewQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Quota atteint",
          message: `Vous avez atteint votre limite de ${quota.limit} avis manuels ce mois (plan gratuit). Passez au plan Pro pour des avis illimités !`,
          remaining: quota.remaining,
          limit: quota.limit,
          used: quota.used,
        },
        { status: 403 }
      );
    }

    // Créer l'avis
    const { data: review, error: insertError } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: user.id,
        business_id: validated.business_id,
        source: "manuel",
        contenu_avis: validated.contenu_avis,
        note: validated.note || null,
        author_name: validated.author_name || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating review:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'avis", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
      quota: {
        remaining: quota.remaining - 1,
        limit: quota.limit,
        used: quota.used + 1,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in create review:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'avis" },
      { status: 500 }
    );
  }
}

