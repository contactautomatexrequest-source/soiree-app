import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // En production, le webhook secret est obligatoire
  if (!webhookSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook secret manquant" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // En local sans webhook secret, on parse directement (ATTENTION : uniquement pour le dev)
    // En production, on vérifie toujours la signature
    if (!webhookSecret) {
      // Mode développement : pas de vérification de signature
      event = JSON.parse(body) as Stripe.Event;
    } else if (!signature) {
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    } else {
      // Mode production : vérification de la signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          // Récupérer le customer_id depuis la session
          const customerId = session.customer as string;
          
          // Récupérer la subscription Stripe pour obtenir current_period_end
          let periodEnd: string | null = null;
          if (session.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            const stripeSubData: any =
              (stripeSubscription as any)?.data ?? stripeSubscription;
            if (stripeSubData?.current_period_end) {
              periodEnd = new Date(
                stripeSubData.current_period_end * 1000
              ).toISOString();
            }
          }
          
          // Mettre à jour la subscription (elle existe déjà grâce au trigger)
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: plan as any,
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: session.subscription as string,
              current_period_end: periodEnd,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, plan")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          // Mapper le priceId au plan
          const priceId = subscription.items.data[0]?.price.id;
          const { STRIPE_PRICE_IDS } = await import("@/lib/stripe");
          
          let newPlan = sub.plan; // Garder le plan actuel par défaut
          if (priceId === STRIPE_PRICE_IDS.pro) {
            newPlan = "pro";
          } else if (priceId === STRIPE_PRICE_IDS.business) {
            newPlan = "business";
          } else if (priceId === STRIPE_PRICE_IDS.agence) {
            newPlan = "agence";
          }

          const periodEnd = (subscription as any).current_period_end as
            | number
            | null
            | undefined;
          const isCanceled = subscription.cancel_at_period_end;
          
          // Déterminer le statut et le plan corrects
          let status: string;
          let finalPlan: string = newPlan;
          
          if (subscription.status === "canceled") {
            status = "canceled";
            finalPlan = "free"; // Plan immédiatement à free si annulé
          } else if (isCanceled && subscription.status === "active") {
            status = "cancel_at_period_end";
            finalPlan = "free"; // Plan immédiatement à free même si annulation programmée
          } else if (subscription.status === "active") {
            status = "active";
            // Garder le plan actuel (pro/business/agence)
          } else {
            status = subscription.status;
            // En cas de statut inconnu, garder le plan actuel
          }
          
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: finalPlan as any,
              status: status as any,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
              stripe_subscription_id: subscription.id,
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          // Quand la subscription est supprimée, repasser en free
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan: "free" as any,
              status: "canceled",
              current_period_end: null,
              stripe_subscription_id: null,
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const invoiceData: any = invoice as any;

        // Mettre à jour la date de fin de période si nécessaire
        if (invoiceData.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            invoiceData.subscription as string
          );
          const stripeSubData: any =
            (stripeSubscription as any)?.data ?? stripeSubscription;
          
          const { data: sub } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (sub) {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "active",
                current_period_end: stripeSubData?.current_period_end
                  ? new Date(
                      stripeSubData.current_period_end * 1000
                    ).toISOString()
                  : null,
              })
              .eq("user_id", sub.user_id);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Noter l'échec de paiement (on peut ajouter un champ dédié si nécessaire)
        // Pour l'instant, on garde le statut actif mais on pourrait notifier l'utilisateur
        console.log(`Payment failed for customer ${customerId}, invoice ${invoice.id}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

