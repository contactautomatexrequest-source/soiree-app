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

  // Compter les réponses du mois en cours (via reviews)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  const used = count || 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

