import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const planHierarchy: Record<string, number> = {
  free: 0,
  pro: 1,
  business: 2,
  agence: 3,
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { targetPlan } = await req.json();

    if (!targetPlan || !["pro", "business", "agence"].includes(targetPlan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[targetPlan as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId || priceId === "price_xxx") {
      return NextResponse.json({ error: "Price ID non configuré" }, { status: 500 });
    }

    // Récupérer l'abonnement actuel
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

    // Récupérer la subscription Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Vérifier si c'est un upgrade ou downgrade
    const currentPlanLevel = planHierarchy[subscription.plan] || 0;
    const targetPlanLevel = planHierarchy[targetPlan] || 0;
    const isDowngrade = targetPlanLevel < currentPlanLevel;

    // Mettre à jour la subscription Stripe
    await stripe.subscriptions.update(stripeSubscription.id, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: "always_invoice", // Proration automatique
    });

    // Mettre à jour Supabase (le webhook mettra à jour le reste)
    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: targetPlan as any,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      newPlan: targetPlan,
      isDowngrade,
    });
  } catch (error: any) {
    console.error("Change plan error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

