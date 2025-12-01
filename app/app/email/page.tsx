"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helper pour vérifier si un plan est payant (pro, business, agence)
function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

export default function EmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [emailAlias, setEmailAlias] = useState<string | null>(null);
  const [reviewEmailAddress, setReviewEmailAddress] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadEmailConfig = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Charger le plan de l'utilisateur
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();
      
      const currentPlan = subscription?.plan || "free";
      
      if (!cancelled) {
        setUserPlan(currentPlan);
        
        // Rediriger les utilisateurs Free vers la page de facturation
        if (!isPaidPlan(currentPlan)) {
          window.location.href = "/app/facturation";
          return;
        }
      }

      // Ne charger la config email que si l'utilisateur a un plan payant
      if (!isPaidPlan(currentPlan)) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("business_profiles")
        .select("id, email_alias")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        if (data) {
          if (!data.email_alias) {
            try {
              const { generateEmailAlias } = await import("@/lib/email/alias");
              const { buildReviewEmailAddress } = await import("@/lib/email/alias");
              const newAlias = generateEmailAlias(data.id);
              const emailAddress = buildReviewEmailAddress(newAlias);
              
              const { error: updateError } = await supabase
                .from("business_profiles")
                .update({ email_alias: newAlias })
                .eq("id", data.id);
              
              if (!updateError) {
                setEmailAlias(newAlias);
                setReviewEmailAddress(emailAddress);
              }
            } catch (err) {
              console.error("Error generating email alias:", err);
            }
          } else {
            try {
              const { buildReviewEmailAddress } = await import("@/lib/email/alias");
              setEmailAlias(data.email_alias);
              setReviewEmailAddress(buildReviewEmailAddress(data.email_alias));
            } catch (err) {
              console.error("Error building email address:", err);
            }
          }
        }
        setLoading(false);
      }
    };
    loadEmailConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopyEmail = async () => {
    if (!reviewEmailAddress) return;
    
    try {
      await navigator.clipboard.writeText(reviewEmailAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Error copying email:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est en plan gratuit, ne rien afficher (redirection en cours)
  if (!isPaidPlan(userPlan)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Message principal (hero) */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-50 mb-2">
          Active les réponses automatiques en 1 seule configuration
        </h1>
        <p className="text-sm text-slate-400">
          Une fois activé, l'IA gère tous tes avis sans aucune intervention.
        </p>
      </div>

      {/* Structure en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 min-h-0">
        {/* Colonne principale */}
        <div className="flex flex-col gap-6 min-h-0">
          {/* Bloc central - Carte principale DOMINANTE */}
          <Card className="bg-gradient-to-br from-indigo-500/25 via-indigo-600/20 to-purple-500/15 border-2 border-indigo-400/60 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.4)] p-6 flex-shrink-0">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-500/30 border-2 border-indigo-400/60 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/40 flex-shrink-0">
                🤖
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-50 mb-4">
                  Tu n'as plus rien à gérer
                </h2>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-300 text-lg mt-0.5">✓</span>
                    <span className="text-sm text-slate-200">Analyse chaque avis automatiquement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-300 text-lg mt-0.5">✓</span>
                    <span className="text-sm text-slate-200">Génère une réponse professionnelle adaptée à ton métier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-300 text-lg mt-0.5">✓</span>
                    <span className="text-sm text-slate-200">Sauvegarde la réponse prête à être publiée</span>
                  </li>
                </ul>
                <p className="text-sm font-semibold text-indigo-200 mt-4">
                  Tu copies, tu colles, c'est publié.
                </p>
              </div>
            </div>
          </Card>

          {/* Bloc sécurité - Visible sans scroller */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">🔒</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-50 mb-1">
                  Nous n'avons jamais accès à ta boîte mail.
                </p>
                <p className="text-xs text-slate-400">
                  Seuls les emails transférés volontairement sont traités. Aucun autre email n'est consulté.
                </p>
              </div>
            </div>
          </Card>

          {/* Bloc "Adresse automatique" - Point d'action principal */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-indigo-500/40 rounded-xl shadow-premium-lg p-6 flex-shrink-0">
            <h3 className="text-lg font-bold text-slate-50 mb-4">Adresse automatique</h3>
            <p className="text-sm text-slate-300 mb-6">
              Transfère simplement les emails Google vers cette adresse.
            </p>

            {reviewEmailAddress ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/90 border-2 border-indigo-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-700/60 rounded-lg text-sm text-indigo-300 font-mono break-all">
                      {reviewEmailAddress}
                    </code>
                    <Button
                      onClick={handleCopyEmail}
                      className={`h-12 px-6 text-base font-semibold bg-accent-gradient hover:bg-accent-gradient-hover shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
                        copySuccess ? "bg-emerald-500 hover:bg-emerald-600" : ""
                      }`}
                    >
                      {copySuccess ? "✓ Copié !" : "Copier l'adresse"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/90 border border-slate-800/60 rounded-lg">
                <p className="text-sm text-slate-400">Génération de l'adresse en cours...</p>
              </div>
            )}
          </Card>
        </div>

        {/* Colonne de droite */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          {/* Bloc automatisation complète */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Automatisation complète</h3>
            <ol className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 font-bold">1.</span>
                <span>L'avis arrive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 font-bold">2.</span>
                <span>L'IA l'analyse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 font-bold">3.</span>
                <span>La réponse est générée</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 font-bold">4.</span>
                <span>Elle apparaît dans ton historique</span>
              </li>
            </ol>
            <p className="text-xs font-semibold text-indigo-300 mt-3">
              Tu n'interviens plus jamais.
            </p>
          </Card>

          {/* Bloc verrou Pro - Affiché uniquement si plan gratuit */}
          {!isPaidPlan(userPlan) && (
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-amber-500/40 rounded-xl shadow-premium p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="text-sm font-bold text-slate-50 mb-2">Fonctionnalité disponible uniquement en Pro</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Débloque l'automatisation complète pour ne plus jamais gérer tes avis manuellement.
                </p>
                <Button
                  onClick={() => router.push("/app/facturation")}
                  className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 hover:border-amber-500/70"
                >
                  Débloquer l'automatisation
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
