import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Variables d'environnement manquantes:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setUserBusinessPlan() {
  const email = "contact.automatex.request@gmail.com";

  try {
    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}`);

    // 1. Trouver l'utilisateur par email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("❌ Erreur lors de la recherche de l'utilisateur:", userError);
      process.exit(1);
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error(`❌ Utilisateur avec l'email "${email}" introuvable.`);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${user.id} (${user.email})`);

    // 2. Vérifier si une subscription existe
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ Erreur lors de la recherche de l'abonnement:", subError);
      process.exit(1);
    }

    if (!subscription) {
      console.log("📝 Création d'un nouvel abonnement business...");
      // Créer une nouvelle subscription
      const { data: newSub, error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: "business",
          status: "active",
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erreur lors de la création de l'abonnement:", insertError);
        process.exit(1);
      }

      console.log("✅ Abonnement créé avec succès!");
      console.log("📊 Détails:", {
        plan: newSub.plan,
        status: newSub.status,
        user_id: newSub.user_id,
      });
    } else {
      console.log("📝 Mise à jour de l'abonnement existant...");
      // Mettre à jour l'abonnement existant
      const { data: updatedSub, error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: "business",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Erreur lors de la mise à jour de l'abonnement:", updateError);
        process.exit(1);
      }

      console.log("✅ Abonnement mis à jour avec succès!");
      console.log("📊 Détails:", {
        plan: updatedSub.plan,
        status: updatedSub.status,
        user_id: updatedSub.user_id,
        updated_at: updatedSub.updated_at,
      });
    }

    console.log("\n🎉 Opération terminée avec succès!");
  } catch (error: any) {
    console.error("❌ Erreur inattendue:", error);
    process.exit(1);
  }
}

setUserBusinessPlan();

