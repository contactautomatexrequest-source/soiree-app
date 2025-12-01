import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { openai } from "@/lib/openai";
import { GenerateResponseSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { checkQuota } from "@/lib/quota";
import { buildPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    // Vérification authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = rateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer dans une minute." },
        { status: 429 }
      );
    }

    // Vérification quota
    const quota = await checkQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Quota atteint",
          message: `Vous avez atteint votre limite de ${quota.limit} réponses ce mois.`,
        },
        { status: 403 }
      );
    }

    // Validation des données
    const body = await req.json();
    const validated = GenerateResponseSchema.parse(body);

    // Récupérer le profil business (utiliser admin pour éviter les problèmes RLS côté serveur)
    const { data: business, error: businessError } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("id", validated.business_id)
      .eq("user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Profil établissement introuvable" },
        { status: 404 }
      );
    }

    // Construire le prompt
    const prompt = buildPrompt(
      business.metier,
      business.ton_marque,
      business.nom_etablissement,
      business.ville,
      validated.contenu_avis,
      validated.note
    );

    // Appeler OpenAI avec une température plus élevée pour plus de variation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en rédaction de réponses professionnelles aux avis Google pour le marché français.
          
RÈGLES ABSOLUES :
- Chaque réponse doit être UNIQUE et ne jamais répéter les structures des réponses précédentes.
- Varie systématiquement les ouvertures, les formulations et les clôtures.
- Sois humain, naturel, professionnel mais simple.
- Adapte ton ton à la note de l'avis (1-5 étoiles).
- Réponds directement au contenu spécifique de l'avis, pas de manière générique.
- Maximum 120 mots, idéalement 80-100 mots.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 400, // Réduit pour forcer la concision
      temperature: 0.9, // Augmenté pour plus de variation et de créativité
      top_p: 0.95, // Pour plus de diversité dans les réponses
    });

    const reponseGeneree = completion.choices[0]?.message?.content || "";

    if (!reponseGeneree) {
      return NextResponse.json(
        { error: "Erreur lors de la génération de la réponse" },
        { status: 500 }
      );
    }

    // Si review_id est fourni, utiliser l'avis existant, sinon créer un nouvel avis
    let reviewId = validated.review_id;

    if (!reviewId) {
      // Créer un nouvel avis
      const { data: review, error: reviewError } = await supabaseAdmin
        .from("reviews")
        .insert({
          user_id: user.id,
          business_id: validated.business_id,
          source: "manuel",
          note: validated.note || null,
          contenu_avis: validated.contenu_avis,
          status: "nouveau",
        })
        .select()
        .single();

      if (reviewError || !review) {
        console.error("Error creating review:", reviewError);
        // On continue même si l'enregistrement échoue
      } else {
        reviewId = review.id;
      }
    } else {
      // Vérifier que l'avis existe et appartient à l'utilisateur
      const { data: existingReview, error: reviewError } = await supabaseAdmin
        .from("reviews")
        .select("id, user_id")
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .single();

      if (reviewError || !existingReview) {
        return NextResponse.json(
          { error: "Avis introuvable ou non autorisé" },
          { status: 404 }
        );
      }
    }

    // Enregistrer ou mettre à jour la réponse
    if (reviewId) {
      // Vérifier si une réponse existe déjà
      const { data: existingResponse } = await supabaseAdmin
        .from("ai_responses")
        .select("id")
        .eq("review_id", reviewId)
        .maybeSingle();

      if (existingResponse) {
        // Mettre à jour la réponse existante
        await supabaseAdmin
          .from("ai_responses")
          .update({
            ton_utilise: business.ton_marque,
            reponse_generee: reponseGeneree,
          })
          .eq("id", existingResponse.id);
      } else {
        // Créer une nouvelle réponse
        await supabaseAdmin.from("ai_responses").insert({
          review_id: reviewId,
          ton_utilise: business.ton_marque,
          reponse_generee: reponseGeneree,
        });
      }

      // Mettre à jour le statut de l'avis
      await supabaseAdmin
        .from("reviews")
        .update({ status: "reponse_prête" })
        .eq("id", reviewId);
    }

    return NextResponse.json({
      reponse: reponseGeneree,
      remaining: quota.remaining - 1,
    });
  } catch (error: any) {
    console.error("Generate response error:", error);
    if (error.issues) {
      // Erreur de validation Zod - extraire le message le plus pertinent
      const contenuAvisError = error.issues.find((issue: any) => issue.path?.includes("contenu_avis"));
      const errorMessage = contenuAvisError?.message || "L'avis doit contenir au moins 10 caractères";
      return NextResponse.json(
        { error: errorMessage, details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

