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

    const { atPeriodEnd = true } = await req.json();

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

    // Récupérer la subscription Stripe pour obtenir les dates
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );
    // Selon la version du SDK Stripe, la subscription peut être retournée
    // soit directement, soit encapsulée dans un objet "Response".
    // On gère les deux cas de manière sûre pour TypeScript.
    const stripeSubData: any =
      (stripeSubscription as any)?.data ?? stripeSubscription;

    // Annuler la subscription Stripe
    if (atPeriodEnd) {
      // Annulation à la fin de la période
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      
      // Mettre à jour Supabase : le plan passe immédiatement à "free" pour retirer l'accès
      // Le statut reste "cancel_at_period_end" pour l'affichage, mais l'utilisateur n'a plus accès aux fonctionnalités payantes
      await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "free" as any,
          status: "cancel_at_period_end",
          current_period_end: stripeSubData?.current_period_end
            ? new Date(stripeSubData.current_period_end * 1000).toISOString()
            : null,
        })
        .eq("user_id", user.id);
    } else {
      // Annulation immédiate
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      // Mettre à jour Supabase immédiatement
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "canceled",
          plan: "free" as any,
          current_period_end: null,
          stripe_subscription_id: null,
        })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      atPeriodEnd,
      message: atPeriodEnd
        ? "Votre abonnement sera annulé à la fin de la période en cours"
        : "Votre abonnement a été annulé immédiatement",
    });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

