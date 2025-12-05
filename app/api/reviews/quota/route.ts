import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { checkManualReviewQuota } from "@/lib/review-quota";

/**
 * Route API pour récupérer les informations de quota pour les avis manuels
 * GET /api/reviews/quota
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const quota = await checkManualReviewQuota(user.id);
    return NextResponse.json(quota);
  } catch (error: any) {
    console.error("Error getting review quota:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération du quota" },
      { status: 500 }
    );
  }
}

