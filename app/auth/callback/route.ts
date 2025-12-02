import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type"); // "signup" pour confirmation d'email
  const next = requestUrl.searchParams.get("next");

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Si c'est une confirmation d'email (type=signup) ou si l'utilisateur vient d'être confirmé
      // Rediriger vers la page de connexion avec un message de succès
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(
          new URL("/sign-in?account_created=true", request.url)
        );
      }

      // Si un paramètre "next" est fourni, l'utiliser
      if (next) {
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Sinon, rediriger vers le dashboard
      return NextResponse.redirect(new URL("/app/valider", request.url));
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(new URL("/sign-in?error=invalid_token", request.url));
}

