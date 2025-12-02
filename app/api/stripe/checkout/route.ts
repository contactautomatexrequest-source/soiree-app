import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !["pro", "business", "agence"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId || priceId === "price_xxx") {
      return NextResponse.json({ error: "Price ID non configuré" }, { status: 500 });
    }

    // Récupérer ou créer le customer Stripe
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId: string;
    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Créer la session de checkout
    // Forcer HTTPS pour les URLs de redirection
    const origin = req.nextUrl.origin.replace(/^http:/, "https:");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/app/facturation?success=true`,
      cancel_url: `${origin}/app/facturation?canceled=true`,
      metadata: { user_id: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

