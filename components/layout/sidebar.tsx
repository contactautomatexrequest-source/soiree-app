"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { useState, useEffect } from "react";

function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<string>("free");

  const loadPlan = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return;
      }

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .single();

      if (subError) {
        // Si pas de subscription trouvée, utiliser "free" par défaut
        setUserPlan("free");
        return;
      }

      // Mettre à jour le plan (toujours mettre à jour pour s'assurer de la synchronisation)
      const newPlan = subscription?.plan || "free";
      setUserPlan(newPlan);
    } catch (error) {
      console.error("Erreur lors du chargement du plan:", error);
      // En cas d'erreur, garder le plan actuel ou utiliser "free"
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Charger immédiatement
    loadPlan();

    // Écouter les événements de mise à jour de subscription
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      if (!cancelled) {
        const newPlan = event.detail;
        setUserPlan(newPlan);
        // Recharger aussi depuis la DB pour confirmer
        setTimeout(() => loadPlan(), 500);
      }
    };

    window.addEventListener("subscription-updated", handleSubscriptionUpdate as EventListener);

    // Rafraîchir le plan toutes les 2 secondes pour détecter les changements automatiquement
    // (plus fréquent pour détecter rapidement les changements après paiement)
    const refreshInterval = setInterval(() => {
      if (!cancelled) {
        loadPlan();
      }
    }, 2000);

    // Rafraîchir aussi quand la fenêtre reprend le focus (retour après paiement Stripe)
    const handleFocus = () => {
      if (!cancelled) {
        loadPlan();
      }
    };
    window.addEventListener("focus", handleFocus);

    // Rafraîchir aussi quand on revient sur la page (visibilitychange)
    const handleVisibilityChange = () => {
      if (!cancelled && !document.hidden) {
        loadPlan();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Écouter aussi les changements de route (au cas où on navigue vers facturation)
    const handleRouteChange = () => {
      if (!cancelled) {
        // Petit délai pour laisser le temps à la page de charger
        setTimeout(() => loadPlan(), 1000);
      }
    };
    // Utiliser pathname comme déclencheur
    if (pathname) {
      handleRouteChange();
    }

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
      window.removeEventListener("subscription-updated", handleSubscriptionUpdate as EventListener);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const navItems = [
    { href: "/app/valider", label: "À valider maintenant", icon: "⚡", highlight: true },
    { href: "/app/historique", label: "Historique", icon: "📋" },
    { href: "/app/email", label: "Avis automatiques", icon: "📧" },
    { href: "/app/profil", label: "Dashboard", icon: "📊" },
    { href: "/app/facturation", label: "Facturation", icon: "💳" },
    // Afficher "Gérer l'abonnement" uniquement pour les plans payants
    ...(isPaidPlan(userPlan) ? [{ href: "/app/gestion", label: "Gérer l'abonnement", icon: "⚙️" }] : []),
  ];

  const planLabels: Record<string, string> = {
    free: "Plan Free",
    pro: "Plan Pro",
    business: "Plan Business",
    agence: "Plan Agence",
  };
  const planLabel = planLabels[userPlan] || `Plan ${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}`;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 min-h-screen p-6">
      <div className="mb-8">
        <Link href="/">
          <h2 className="text-xl font-bold mb-3 text-black bg-white px-3 py-1 rounded inline-block hover:bg-slate-100 transition-colors duration-200 cursor-pointer">AvisPro</h2>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium shadow-sm shadow-indigo-500/10">
            {planLabel}
          </Badge>
          <GoogleBadge className="scale-75" />
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-out relative ${
                isActive
                  ? item.highlight
                    ? "bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-slate-50 border border-emerald-500/40 shadow-md shadow-emerald-500/20 font-semibold"
                    : "bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 text-slate-50 border border-indigo-500/40 shadow-md shadow-indigo-500/20 font-semibold"
                  : item.highlight
                  ? "text-emerald-300 hover:bg-emerald-500/10 hover:translate-x-1 hover:text-emerald-200 border border-emerald-500/20"
                  : "text-slate-300 hover:bg-slate-900/50 hover:translate-x-1 hover:text-slate-100"
              }`}
            >
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full animate-slide-in-bar shadow-glow ${
                  item.highlight ? "bg-gradient-to-b from-emerald-400 to-indigo-400" : "bg-accent-gradient"
                }`}></div>
              )}
              <span className="transition-transform duration-200">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-8 border-t border-slate-800">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full transition-all duration-200 ease-out bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-100"
        >
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

