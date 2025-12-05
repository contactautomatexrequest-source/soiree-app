import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractAliasFromEmail } from "@/lib/email/alias";
import { extractReviewFromEmail } from "@/lib/email/extract-review";
import { resolveEstablishmentFromAlias } from "@/lib/email/resolve-establishment";

/**
 * Webhook pour recevoir les emails de Resend
 * Documentation: https://resend.com/docs/dashboard/webhooks
 * 
 * SÉCURITÉ RENFORCÉE :
 * - Mapping UNIQUEMENT via incoming_alias
 * - Double vérification user_id + business_id
 * - Logs détaillés pour traçabilité
 * - Protection contre les doublons
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let emailReceived = false;
  let aliasExtracted: string | null = null;
  let establishmentFound: string | null = null;
  let reviewCreated = false;

  try {
    const body = await req.json();

    // Resend envoie les emails dans un format spécifique
    const emailData = body.data || body;
    
    // Extraire les informations de l'email
    const to = emailData.to || emailData.recipient || "";
    const from = emailData.from || emailData.sender || "";
    const subject = emailData.subject || "";
    const textBody = emailData.text || emailData.body?.text || "";
    const htmlBody = emailData.html || emailData.body?.html || "";
    const messageId = emailData.message_id || emailData.id || "";

    emailReceived = true;

    // LOG 1: Email reçu
    console.log(`[EMAIL_WEBHOOK] Email received - To: ${to}, From: ${from}, Subject: ${subject}, MessageID: ${messageId}`);

    // Extraire l'alias depuis l'adresse email
    if (!to.includes("@")) {
      console.warn(`[EMAIL_WEBHOOK] Invalid email format: ${to}`);
      return NextResponse.json({ 
        received: true, 
        message: "Invalid email format",
        logged: true 
      });
    }

    const [localPart, domain] = to.split("@");
    
    // Vérifier que c'est bien notre domaine
    if (domain !== "avisprofr.com") {
      console.warn(`[EMAIL_WEBHOOK] Email not from avisprofr.com domain: ${to}`);
      return NextResponse.json({ 
        received: true, 
        message: "Wrong domain",
        logged: true 
      });
    }

    aliasExtracted = localPart;

    // LOG 2: Alias extrait
    console.log(`[EMAIL_WEBHOOK] Alias extracted: ${aliasExtracted}`);

    // Utiliser la fonction utilitaire centralisée pour résoudre l'alias
    const establishmentMapping = await resolveEstablishmentFromAlias(to);

    if (!establishmentMapping) {
      // LOG 3: Aucun établissement trouvé
      console.warn(`[EMAIL_WEBHOOK] No business profile found for alias: ${aliasExtracted} (email: ${to})`);
      
      // Enregistrer l'email rejeté dans une table de logs (si elle existe)
      try {
        await supabaseAdmin.from("email_rejection_logs").insert({
          email_to: to,
          alias_extracted: aliasExtracted,
          reason: "no_establishment_found",
          message_id: messageId,
          received_at: new Date().toISOString(),
        });
      } catch (e) {
        // Table peut ne pas exister, on ignore l'erreur
      }

      return NextResponse.json({ 
        received: true, 
        message: "Business not found",
        logged: true 
      });
    }

    const { userId, establishmentId, businessProfile } = establishmentMapping;
    establishmentFound = establishmentId;

    // LOG 4: Établissement trouvé
    console.log(`[EMAIL_WEBHOOK] Establishment found - ID: ${establishmentId}, UserID: ${userId}, Business: ${businessProfile.nom_etablissement}`);

    // Vérifier que l'utilisateur a un plan payant (import automatique interdit pour free)
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .single();

    const plan = subscription?.plan || "free";
    if (plan === "free") {
      console.log(`[EMAIL_WEBHOOK] Import automatique refusé pour plan free - UserID: ${userId}`);
      return NextResponse.json({
        received: true,
        message: "Import automatique non disponible avec le plan gratuit",
        logged: true,
      });
    }

    // Vérification de sécurité : s'assurer que l'établissement appartient bien à l'utilisateur
    // (double vérification même si resolveEstablishmentFromAlias le fait déjà)
    const { data: ownershipCheck } = await supabaseAdmin
      .from("business_profiles")
      .select("user_id")
      .eq("id", establishmentId)
      .eq("user_id", userId)
      .single();

    if (!ownershipCheck) {
      console.error(`[EMAIL_WEBHOOK] SECURITY: Ownership mismatch - Establishment ${establishmentId} does not belong to user ${userId}`);
      return NextResponse.json(
        { error: "Ownership validation failed" },
        { status: 403 }
      );
    }

    // Vérifier si cet email a déjà été traité
    // Triple vérification : business_id, user_id ET message_id
    if (messageId) {
      const { data: existingReview } = await supabaseAdmin
        .from("reviews")
        .select("id")
        .eq("business_id", establishmentId)
        .eq("user_id", userId)
        .eq("email_message_id", messageId)
        .maybeSingle();

      if (existingReview) {
        console.log(`[EMAIL_WEBHOOK] Email already processed: ${messageId} for establishment ${establishmentId}`);
        return NextResponse.json({ 
          received: true, 
          message: "Already processed",
          logged: true 
        });
      }
    }

    // Extraire les informations de l'avis depuis l'email
    const emailBody = textBody || htmlBody.replace(/<[^>]+>/g, " ");
    const extractedReview = await extractReviewFromEmail(subject, emailBody);

    if (!extractedReview || !extractedReview.reviewText) {
      console.warn(`[EMAIL_WEBHOOK] Could not extract review from email: ${messageId}`);
      
      // Sauvegarder quand même l'email brut pour traitement manuel
      const { error: insertError } = await supabaseAdmin.from("reviews").insert({
        user_id: userId,
        business_id: establishmentId,
        source: "email_auto",
        contenu_avis: `[Email non analysé] ${subject}`,
        email_message_id: messageId,
        email_raw_content: emailBody.substring(0, 2000),
      });

      if (insertError) {
        console.error(`[EMAIL_WEBHOOK] Error saving unparsed email: ${insertError.message}`);
      } else {
        console.log(`[EMAIL_WEBHOOK] Unparsed email saved for manual review - Establishment: ${establishmentId}`);
      }

      return NextResponse.json({ 
        received: true, 
        message: "Review extraction failed, saved for manual review",
        logged: true 
      });
    }

    // Créer l'avis dans la base
    // Triple vérification : user_id ET business_id ET message_id
    const { error: insertError, data: insertedReview } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: userId,
        business_id: establishmentId,
        source: "email_auto",
        note: extractedReview.rating || null,
        contenu_avis: extractedReview.reviewText,
        author_name: extractedReview.reviewerName || null,
        email_message_id: messageId,
        email_raw_content: emailBody.substring(0, 1000), // Limiter la taille
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(`[EMAIL_WEBHOOK] Error inserting review: ${insertError.message}`);
      return NextResponse.json(
        { error: "Failed to save review", details: insertError.message },
        { status: 500 }
      );
    }

    reviewCreated = true;

    // LOG 5: Avis créé avec succès
    console.log(`[EMAIL_WEBHOOK] Review created successfully - ReviewID: ${insertedReview.id}, Establishment: ${establishmentId}, UserID: ${userId}, Processing time: ${Date.now() - startTime}ms`);

    return NextResponse.json({ 
      received: true, 
      message: "Review created",
      reviewId: insertedReview.id,
      logged: true 
    });
  } catch (error: any) {
    console.error(`[EMAIL_WEBHOOK] Error processing email: ${error.message}`, error);
    
    // Log de l'erreur complète
    console.error(`[EMAIL_WEBHOOK] Error details:`, {
      emailReceived,
      aliasExtracted,
      establishmentFound,
      reviewCreated,
      error: error.message,
      stack: error.stack,
    });

    // Toujours retourner 200 pour éviter que Resend ne réessaie indéfiniment
    return NextResponse.json(
      { 
        received: true, 
        error: error.message,
        logged: true 
      },
      { status: 200 }
    );
  }
}
