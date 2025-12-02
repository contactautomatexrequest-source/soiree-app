import { supabaseAdmin } from "./supabase/admin";

const QUOTA_LIMITS = {
  free: 5,
  pro: 10000, // Quasi illimité avec garde-fou technique
  business: 10000,
  agence: 10000,
};

export async function checkQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  // Récupérer la subscription
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = subscription?.plan || "free";
  const limit = QUOTA_LIMITS[plan as keyof typeof QUOTA_LIMITS] || QUOTA_LIMITS.free;

  // Compter les réponses IA générées ce mois (via ai_responses)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Récupérer tous les IDs des avis de l'utilisateur
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("id")
    .eq("user_id", userId);
  
  const reviewIds = reviews?.map(r => r.id) || [];
  
  // Compter les réponses IA générées ce mois pour ces avis
  let used = 0;
  if (reviewIds.length > 0) {
    const { count } = await supabaseAdmin
      .from("ai_responses")
      .select("id", { count: "exact", head: true })
      .in("review_id", reviewIds)
      .gte("created_at", startOfMonth.toISOString());
    
    used = count || 0;
  }
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

