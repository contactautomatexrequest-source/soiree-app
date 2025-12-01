import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Variables d'environnement manquantes");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listUsers() {
  try {
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("❌ Erreur:", error);
      process.exit(1);
    }

    console.log(`📋 ${users.users.length} utilisateur(s) trouvé(s):\n`);
    
    for (const user of users.users) {
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .single();

      console.log(`Email: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Plan: ${sub?.plan || "N/A"}`);
      console.log(`  Status: ${sub?.status || "N/A"}`);
      console.log("");
    }
  } catch (error: any) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

listUsers();

