import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type"); // "signup", "email", "recovery", etc.
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Gérer les erreurs venant de Supabase
  if (error) {
    const errorMessage = errorDescription || error;
    let redirectUrl = "/sign-in?error=" + encodeURIComponent(errorMessage);
    
    // Messages d'erreur spécifiques en français
    if (error === "invalid_token" || error === "token_expired") {
      redirectUrl = "/sign-in?error=" + encodeURIComponent("Lien de confirmation invalide ou expiré. Veuillez demander un nouveau lien.");
    } else if (error === "email_already_confirmed") {
      redirectUrl = "/sign-in?error=" + encodeURIComponent("Cet email est déjà confirmé. Vous pouvez vous connecter.");
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );

  // Gérer le code (méthode moderne Supabase)
  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      // Gérer les erreurs spécifiques
      let errorMessage = "Lien de confirmation invalide ou expiré.";
      if (exchangeError.message.includes("expired")) {
        errorMessage = "Le lien de confirmation a expiré. Veuillez demander un nouveau lien.";
      } else if (exchangeError.message.includes("already")) {
        errorMessage = "Cet email est déjà confirmé. Vous pouvez vous connecter.";
      }
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    if (data.user) {
      // L'utilisateur est maintenant connecté (la session est créée via exchangeCodeForSession)
      // Si c'est une confirmation d'email (signup), connecter automatiquement
      
      // Si un paramètre "next" est fourni, l'utiliser
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Rediriger directement vers le dashboard (l'utilisateur est déjà connecté)
      // Si c'est une confirmation d'email, on peut ajouter un paramètre pour afficher un message
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(
          new URL("/app/valider?account_created=true", request.url)
        );
      }

      // Sinon, rediriger vers le dashboard
      return NextResponse.redirect(new URL("/app/valider", request.url));
    }
  }

  // Gérer le token (ancienne méthode Supabase, pour compatibilité)
  if (token) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type === "signup" ? "signup" : "email",
    });

    if (verifyError) {
      let errorMessage = "Lien de confirmation invalide ou expiré.";
      if (verifyError.message.includes("expired")) {
        errorMessage = "Le lien de confirmation a expiré. Veuillez demander un nouveau lien.";
      } else if (verifyError.message.includes("already")) {
        errorMessage = "Cet email est déjà confirmé. Vous pouvez vous connecter.";
      }
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    if (data.user) {
      // L'utilisateur est maintenant connecté (la session est créée via verifyOtp)
      // Si c'est une confirmation d'email, connecter automatiquement
      
      // Si un paramètre "next" est fourni, l'utiliser
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Rediriger directement vers le dashboard (l'utilisateur est déjà connecté)
      // Si c'est une confirmation d'email, on peut ajouter un paramètre pour afficher un message
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(
          new URL("/app/valider?account_created=true", request.url)
        );
      }

      // Sinon, rediriger vers le dashboard
      return NextResponse.redirect(new URL("/app/valider", request.url));
    }
  }

  // Si ni code ni token, rediriger vers sign-in avec erreur
  return NextResponse.redirect(
    new URL("/sign-in?error=" + encodeURIComponent("Lien de confirmation invalide."), request.url)
  );
}

