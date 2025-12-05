import { supabaseAdmin } from "./supabase/admin";

/**
 * Limites d'avis manuels par plan
 */
const MANUAL_REVIEW_LIMITS = {
  free: 5, // Plan free : 5 avis manuels maximum
  pro: 10000, // Quasi illimité
  business: 10000,
  agence: 10000,
};

/**
 * Vérifie si un utilisateur peut créer un avis manuel
 * Pour le plan free : limite de 5 avis manuels (source='manuel')
 * Pour les plans payants : illimité
 */
export async function checkManualReviewQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
}> {
  // Récupérer la subscription
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = subscription?.plan || "free";
  const limit = MANUAL_REVIEW_LIMITS[plan as keyof typeof MANUAL_REVIEW_LIMITS] || MANUAL_REVIEW_LIMITS.free;

  // Pour les plans payants, pas de limite
  if (plan !== "free") {
    return {
      allowed: true,
      remaining: 10000,
      limit: 10000,
      used: 0,
    };
  }

  // Pour le plan free : compter les avis manuels créés ce mois
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("source", "manuel")
    .gte("created_at", startOfMonth.toISOString());

  const used = count || 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    remaining,
    limit,
    used,
  };
}

/**
 * Vérifie si un utilisateur peut utiliser la génération automatique de réponse
 * Plan free : interdit
 * Plans payants : autorisé
 */
export async function canUseAutoResponse(userId: string): Promise<boolean> {
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = subscription?.plan || "free";
  return plan !== "free";
}

/**
 * Vérifie si un utilisateur peut utiliser l'import automatique
 * Plan free : interdit
 * Plans payants : autorisé
 */
export async function canUseAutoImport(userId: string): Promise<boolean> {
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = subscription?.plan || "free";
  return plan !== "free";
}

