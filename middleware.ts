import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // FORCER HTTPS : Rediriger toutes les requêtes HTTP vers HTTPS
    const url = request.nextUrl.clone();
    const hostname = request.headers.get("host") || "";
    
    // En production, forcer HTTPS (sauf localhost pour le dev)
    // Netlify gère déjà cette redirection, mais on la force aussi au niveau app pour sécurité
    if (
      process.env.NODE_ENV === "production" &&
      request.nextUrl.protocol === "http:" &&
      !hostname.includes("localhost") &&
      !hostname.includes("127.0.0.1")
    ) {
      url.protocol = "https:";
      return NextResponse.redirect(url, 301); // Redirection permanente
    }

    const pathname = request.nextUrl.pathname;
    
    // Routes publiques : on laisse passer sans traitement Supabase
    const publicRoutes = ["/sign-in", "/sign-up", "/"];
    if (publicRoutes.includes(pathname) || pathname.startsWith("/sign-")) {
      return NextResponse.next();
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Vérifier que les variables d'environnement sont définies pour les routes protégées
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      // Pour les routes protégées, on redirige vers sign-in
      if (pathname.startsWith("/app")) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return response;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Si erreur d'authentification, on continue sans bloquer
    if (error) {
      // Silently handle auth errors for public routes
    }

    // Protéger les routes /app/* (nécessite authentification)
    if (pathname.startsWith("/app")) {
      if (!user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }

    // Rediriger les utilisateurs connectés depuis /sign-in et /sign-up
    if ((pathname === "/sign-in" || pathname === "/sign-up") && user) {
      return NextResponse.redirect(new URL("/app/valider", request.url));
    }

    return response;
  } catch (error) {
    // En cas d'erreur, on laisse passer la requête pour éviter de bloquer
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/app/:path*",
    "/api/:path*",
  ],
};

