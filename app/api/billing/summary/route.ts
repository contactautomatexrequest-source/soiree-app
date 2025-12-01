import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    // Charger l'abonnement
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement non trouvé" }, { status: 404 });
    }

    // Charger les métriques du mois
    const { data: allReviews } = await supabaseAdmin
      .from("reviews")
      .select("*, ai_responses(id, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const avisCeMois = allReviews?.filter(
      (r) => new Date(r.created_at) >= debutMois
    ) || [];

    const avisAvecReponse = allReviews?.filter((r) => r.ai_responses && r.ai_responses.length > 0) || [];
    const avisTraitesCeMois = avisCeMois.filter((r) => r.ai_responses && r.ai_responses.length > 0);
    const avisNegatifs = allReviews?.filter((r) => r.note !== null && r.note <= 2) || [];
    const avisNegatifsNeutralises = avisNegatifs.filter((r) => r.ai_responses && r.ai_responses.length > 0).length;

    const tauxReponseGlobal = allReviews && allReviews.length > 0
      ? Math.round((avisAvecReponse.length / allReviews.length) * 100)
      : 0;

    const protectionActive = avisTraitesCeMois.length > 0;
    const economieTemps = avisTraitesCeMois.length * 5;

    const dernierAvisTraite = avisAvecReponse.length > 0 && avisAvecReponse[0].ai_responses
      ? new Date(avisAvecReponse[0].ai_responses[0].created_at).toISOString()
      : null;

    const reponsesPubliees = allReviews?.filter((r) => {
      return r.ai_responses && r.ai_responses.length > 0;
    }).length || 0;

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
      },
      metrics: {
        protectionActive,
        avisProtegesCeMois: avisTraitesCeMois.length,
        tempsEconomise: economieTemps,
        tauxReponseGlobal,
        avisTraitesAuto: avisTraitesCeMois.length,
        avisNegatifsNeutralises,
        reponsesPubliees,
        derniereActionIA: dernierAvisTraite,
      },
    });
  } catch (error: any) {
    console.error("Billing summary error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

