import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractAliasFromEmail } from "@/lib/email/alias";
import { extractReviewFromEmail } from "@/lib/email/extract-review";

/**
 * Webhook pour recevoir les emails de Resend
 * Documentation: https://resend.com/docs/dashboard/webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Resend envoie les emails dans un format spécifique
    // Vérifier la structure selon la doc Resend
    const emailData = body.data || body;
    
    // Extraire les informations de l'email
    const to = emailData.to || emailData.recipient || "";
    const from = emailData.from || emailData.sender || "";
    const subject = emailData.subject || "";
    const textBody = emailData.text || emailData.body?.text || "";
    const htmlBody = emailData.html || emailData.body?.html || "";
    const messageId = emailData.message_id || emailData.id || "";

    // Extraire l'alias depuis l'adresse destinataire
    // Format attendu : avis-{id}@avisprofr.com ou n'importe quoi@avisprofr.com (catch-all)
    // On extrait la partie avant @ pour trouver l'alias
    let alias: string | null = null;
    
    // Si l'email est sur le domaine avisprofr.com, extraire la partie locale
    if (to.includes('@avisprofr.com')) {
      const localPart = to.split('@')[0];
      // Si c'est au format avis-{id}, utiliser tel quel
      if (localPart.startsWith('avis-')) {
        alias = localPart;
      } else {
        // Sinon, essayer d'extraire avec la fonction existante (pour compatibilité)
        alias = extractAliasFromEmail(to);
      }
    } else {
      // Format ancien avec avis+{hash}@domain.com
      alias = extractAliasFromEmail(to);
    }
    
    if (!alias) {
      console.warn(`No alias found in email to: ${to}`);
      return NextResponse.json({ received: true, message: "No alias found" });
    }

    // Trouver l'établissement correspondant via incoming_alias
    // Cette recherche est sécurisée : seul l'établissement avec cet alias recevra l'avis
    // Le mapping se fait UNIQUEMENT via incoming_alias, jamais via le contenu de l'email
    const { data: businessProfile, error: businessError } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id")
      .eq("incoming_alias", alias)
      .single();

    if (businessError || !businessProfile) {
      console.warn(`No business profile found for alias: ${alias}`);
      return NextResponse.json({ received: true, message: "Business not found" });
    }

    // Vérifier si cet email a déjà été traité
    if (messageId) {
      const { data: existingReview } = await supabaseAdmin
        .from("reviews")
        .select("id")
        .eq("business_id", businessProfile.id)
        .eq("email_message_id", messageId)
        .single();

      if (existingReview) {
        console.log(`Email already processed: ${messageId}`);
        return NextResponse.json({ received: true, message: "Already processed" });
      }
    }

    // Extraire les informations de l'avis depuis l'email
    const emailBody = textBody || htmlBody.replace(/<[^>]+>/g, " ");
    const extractedReview = await extractReviewFromEmail(subject, emailBody);

    if (!extractedReview || !extractedReview.reviewText) {
      console.warn(`Could not extract review from email: ${messageId}`);
      // Sauvegarder quand même l'email brut pour traitement manuel
      await supabaseAdmin.from("reviews").insert({
        user_id: businessProfile.user_id,
        business_id: businessProfile.id,
        source: "email_auto",
        contenu_avis: `[Email non analysé] ${subject}`,
        email_message_id: messageId,
        email_raw_content: emailBody.substring(0, 2000),
      });
      return NextResponse.json({ received: true, message: "Review extraction failed" });
    }

    // Créer l'avis dans la base
    const { error: insertError } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: businessProfile.user_id,
        business_id: businessProfile.id,
        source: "email_auto",
        note: extractedReview.rating || null,
        contenu_avis: extractedReview.reviewText,
        author_name: extractedReview.reviewerName || null,
        email_message_id: messageId,
        email_raw_content: emailBody.substring(0, 1000), // Limiter la taille
      });

    if (insertError) {
      console.error("Error inserting review:", insertError);
      return NextResponse.json(
        { error: "Failed to save review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true, message: "Review created" });
  } catch (error: any) {
    console.error("Email webhook error:", error);
    // Toujours retourner 200 pour éviter que Resend ne réessaie
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}

