import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'abonnement
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ error: "Abonnement non trouvé" }, { status: 404 });
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ error: "Aucune subscription Stripe trouvée" }, { status: 400 });
    }

    // Récupérer la subscription Stripe pour obtenir le plan
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Reprendre la subscription Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Mapper le priceId au plan
    const priceId = stripeSubscription.items.data[0]?.price.id;
    const { STRIPE_PRICE_IDS } = await import("@/lib/stripe");
    
    let restoredPlan = "free"; // Par défaut
    if (priceId === STRIPE_PRICE_IDS.pro) {
      restoredPlan = "pro";
    } else if (priceId === STRIPE_PRICE_IDS.business) {
      restoredPlan = "business";
    } else if (priceId === STRIPE_PRICE_IDS.agence) {
      restoredPlan = "agence";
    }

    // Mettre à jour Supabase : restaurer le plan et le statut
    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: restoredPlan as any,
        status: "active",
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      message: "Votre abonnement a été repris avec succès",
    });
  } catch (error: any) {
    console.error("Resume subscription error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

