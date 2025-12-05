import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Route callback OAuth Google Business Profile
 * Échange le code contre un access token et récupère les infos du profil
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in?error=Non authentifié", req.url));
    }

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");

    // Vérifier que l'état correspond à l'utilisateur (sécurité)
    if (state !== user.id) {
      return NextResponse.redirect(
        new URL("/app/profil?error=État de sécurité invalide", req.url)
      );
    }

    if (error) {
      return NextResponse.redirect(
        new URL(`/app/profil?error=${encodeURIComponent(error)}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/app/profil?error=Code OAuth manquant", req.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/app/profil?error=Configuration Google manquante", req.url)
      );
    }

    // Échanger le code contre un access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange error:", errorData);
      return NextResponse.redirect(
        new URL("/app/profil?error=Erreur lors de l'échange du token", req.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token || !refresh_token) {
      return NextResponse.redirect(
        new URL("/app/profil?error=Tokens Google manquants", req.url)
      );
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));

    // Récupérer les informations du compte Google Business
    // Pour obtenir le placeId, on doit utiliser l'API Google Business Profile
    // Pour l'instant, on stocke les tokens et l'utilisateur devra fournir le placeId lors de la première sync
    // ou on peut essayer de récupérer la liste des établissements
    
    // Stocker les tokens temporairement (sans placeId pour l'instant)
    // L'utilisateur devra déclencher une sync avec son placeId
    const { error: insertError } = await supabaseAdmin
      .from("google_business_profiles")
      .insert({
        user_id: user.id,
        google_place_id: `temp-${user.id}`, // Temporaire, sera remplacé lors de la sync
        google_account_id: user.id, // Temporaire
        nom_etablissement: "En attente de synchronisation",
        access_token,
        refresh_token,
        expires_at: expiresAt,
        sync_en_cours: false,
      });

    if (insertError) {
      console.error("Error storing Google tokens:", insertError);
      return NextResponse.redirect(
        new URL("/app/profil?error=Erreur lors du stockage des tokens", req.url)
      );
    }

    // Rediriger vers le profil avec un message de succès
    // La synchronisation se fera automatiquement après
    return NextResponse.redirect(
      new URL("/app/profil?google_connected=true", req.url)
    );
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/app/profil?error=Erreur lors de la connexion Google", req.url)
    );
  }
}

