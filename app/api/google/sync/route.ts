import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  fetchGoogleBusinessProfile,
  fetchGoogleReviews,
  refreshGoogleAccessToken,
  isTokenExpired,
} from "@/lib/google/business-profile";

/**
 * Route pour synchroniser les données Google Business Profile
 * Récupère automatiquement : profil, avis, statistiques
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { placeId, businessProfileId } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: "Place ID Google requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a un plan payant (import automatique interdit pour free)
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const plan = subscription?.plan || "free";
    if (plan === "free") {
      return NextResponse.json(
        {
          error: "Plan gratuit",
          message: "L'import automatique depuis Google n'est pas disponible avec le plan gratuit. Passez au plan Pro pour activer cette fonctionnalité !",
        },
        { status: 403 }
      );
    }

    // Récupérer le profil Google Business de l'utilisateur
    const { data: googleProfile, error: profileError } = await supabaseAdmin
      .from("google_business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("google_place_id", placeId)
      .single();

    if (profileError || !googleProfile) {
      return NextResponse.json(
        { error: "Profil Google Business non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le profil appartient bien à l'utilisateur (sécurité serveur)
    if (googleProfile.user_id !== user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier et rafraîchir le token si nécessaire
    let accessToken = googleProfile.access_token;
    if (isTokenExpired(new Date(googleProfile.expires_at))) {
      const refreshed = await refreshGoogleAccessToken(googleProfile.refresh_token);
      if (!refreshed) {
        return NextResponse.json(
          { error: "Impossible de rafraîchir le token Google" },
          { status: 401 }
        );
      }

      accessToken = refreshed.accessToken;
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshed.expiresIn);

      // Mettre à jour le token
      await supabaseAdmin
        .from("google_business_profiles")
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
        })
        .eq("id", googleProfile.id);
    }

    // Marquer la synchronisation en cours
    await supabaseAdmin
      .from("google_business_profiles")
      .update({ sync_en_cours: true, derniere_erreur: null })
      .eq("id", googleProfile.id);

    try {
      // 1. Récupérer les données du profil Google Business
      const businessData = await fetchGoogleBusinessProfile(placeId, accessToken);

      if (!businessData) {
        throw new Error("Impossible de récupérer les données du profil Google");
      }

      // 2. Récupérer les avis Google
      const reviews = await fetchGoogleReviews(placeId, accessToken);

      // 3. Mettre à jour le profil Google Business dans Supabase
      const updateData: any = {
        nom_etablissement: businessData.displayName,
        categorie_principale: businessData.primaryCategory,
        adresse_complete: businessData.formattedAddress,
        ville: businessData.addressComponents.locality,
        code_postal: businessData.addressComponents.postalCode,
        pays: businessData.addressComponents.country || "France",
        url_fiche: businessData.websiteUri,
        note_moyenne: businessData.rating,
        nombre_avis: businessData.userRatingCount || 0,
        photo_principale: businessData.photos?.[0]?.name || null,
        derniere_sync_at: new Date().toISOString(),
        prochaine_sync_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Prochaine sync dans 6h
        sync_en_cours: false,
        derniere_erreur: null,
      };

      // Si un business_profile_id est fourni, lier les deux
      if (businessProfileId) {
        // Vérifier que le business_profile appartient bien à l'utilisateur
        const { data: businessProfile } = await supabaseAdmin
          .from("business_profiles")
          .select("id, user_id")
          .eq("id", businessProfileId)
          .eq("user_id", user.id)
          .single();

        if (businessProfile) {
          updateData.business_profile_id = businessProfileId;
        }
      }

      await supabaseAdmin
        .from("google_business_profiles")
        .update(updateData)
        .eq("id", googleProfile.id);

      // 4. Synchroniser les avis (uniquement les nouveaux)
      let avisSynchronises = 0;
      let avisDejaExistants = 0;

      for (const review of reviews) {
        // Vérifier si l'avis existe déjà
        const { data: existingReview } = await supabaseAdmin
          .from("reviews")
          .select("id")
          .eq("google_review_id", review.reviewId)
          .eq("google_place_id", placeId)
          .single();

        if (existingReview) {
          avisDejaExistants++;
          continue;
        }

        // Déterminer le business_profile_id à utiliser
        let targetBusinessProfileId = googleProfile.business_profile_id;
        
        // Si pas de business_profile lié, créer ou trouver un établissement
        if (!targetBusinessProfileId) {
          // Chercher un établissement existant avec le même nom
          const { data: existingBusiness } = await supabaseAdmin
            .from("business_profiles")
            .select("id")
            .eq("user_id", user.id)
            .eq("nom_etablissement", businessData.displayName)
            .limit(1)
            .maybeSingle();

          if (existingBusiness) {
            targetBusinessProfileId = existingBusiness.id;
            // Lier le profil Google au business_profile
            await supabaseAdmin
              .from("google_business_profiles")
              .update({ business_profile_id: existingBusiness.id })
              .eq("id", googleProfile.id);
          } else {
            // Créer un nouveau business_profile depuis les données Google
            const { data: newBusiness, error: createError } = await supabaseAdmin
              .from("business_profiles")
              .insert({
                user_id: user.id,
                nom_etablissement: businessData.displayName,
                ville: businessData.addressComponents.locality || "",
                metier: "restaurant", // Par défaut, à ajuster selon la catégorie
                ton_marque: "chaleureux",
              })
              .select("id")
              .single();

            if (!createError && newBusiness) {
              targetBusinessProfileId = newBusiness.id;
              // Lier le profil Google au nouveau business_profile
              await supabaseAdmin
                .from("google_business_profiles")
                .update({ business_profile_id: newBusiness.id })
                .eq("id", googleProfile.id);
            }
          }
        }

        if (!targetBusinessProfileId) {
          console.warn("Impossible de créer/trouver un business_profile pour l'avis");
          continue;
        }

        // Créer l'avis dans Supabase
        const { error: reviewError } = await supabaseAdmin
          .from("reviews")
          .insert({
            user_id: user.id,
            business_id: targetBusinessProfileId,
            source: "email_auto", // Ou créer un nouveau type "google_sync"
            note: review.rating,
            contenu_avis: review.comment || "",
            author_name: review.reviewer.displayName,
            google_review_id: review.reviewId,
            google_place_id: placeId,
            created_at: review.createTime || new Date().toISOString(),
          });

        if (!reviewError) {
          avisSynchronises++;
        } else {
          console.error("Error inserting review:", reviewError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Synchronisation réussie",
        data: {
          profil: updateData,
          avis: {
            synchronises: avisSynchronises,
            dejaExistants: avisDejaExistants,
            total: reviews.length,
          },
        },
      });
    } catch (syncError: any) {
      // Enregistrer l'erreur
      await supabaseAdmin
        .from("google_business_profiles")
        .update({
          sync_en_cours: false,
          derniere_erreur: syncError.message || "Erreur inconnue",
        })
        .eq("id", googleProfile.id);

      console.error("Sync error:", syncError);
      return NextResponse.json(
        { error: syncError.message || "Erreur lors de la synchronisation" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Google sync error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

