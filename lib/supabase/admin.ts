import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Retourne le client Supabase admin (lazy initialization)
 * La vérification de SUPABASE_SERVICE_ROLE_KEY se fait au moment de l'utilisation
 * plutôt qu'à l'import pour éviter les erreurs lors du build
 */
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Vérifier les variables d'environnement uniquement au moment de l'utilisation
  // (pas à l'import pour éviter les erreurs lors du build)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}

// Export pour compatibilité avec le code existant
// Le proxy permet d'utiliser supabaseAdmin comme avant tout en faisant une initialisation lazy
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    // Si c'est une fonction, bind le contexte
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

