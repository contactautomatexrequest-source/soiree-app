import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

/**
 * Route pour initier la connexion OAuth Google Business Profile
 * Redirige vers Google OAuth avec les scopes nécessaires
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/google/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth non configuré" },
        { status: 500 }
      );
    }

    // Scopes nécessaires pour Google Business Profile API
    const scopes = [
      "https://www.googleapis.com/auth/business.manage", // Gestion du profil Business
      "https://www.googleapis.com/auth/places", // Accès aux Places API
    ].join(" ");

    // Paramètres OAuth
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline", // Pour obtenir un refresh_token
      prompt: "consent", // Forcer le consentement pour obtenir le refresh_token
      state: user.id, // Passer l'ID utilisateur pour sécurité
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion Google" },
      { status: 500 }
    );
  }
}

