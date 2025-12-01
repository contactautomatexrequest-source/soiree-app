"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    id: "free",
    name: "Essai gratuit",
    price: "0€",
    features: ["5 réponses / mois", "Mode simple uniquement", "Risque pour ton image"],
    cta: "Essayer",
  },
  {
    id: "pro",
    name: "Pro",
    price: "23,99€",
    priceNote: "Moins d'1€ par jour",
    features: [
      "Tu ne laisses plus jamais un avis sans réponse",
      "Les avis arrivent et sont traités automatiquement",
      "Ton établissement garde une image professionnelle en permanence",
      "Assistance prioritaire en cas de problème",
    ],
    cta: "S'abonner",
  },
  {
    id: "business",
    name: "Business",
    price: "48,99€",
    features: ["Tous les avantages Pro", "Jusqu'à 3 établissements", "Gestion centralisée"],
    cta: "Choisir Business",
  },
];

// Modale de downgrade anti-churn
function DowngradeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  targetPlan,
  changingPlan = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  targetPlan: string;
  changingPlan?: boolean;
}) {
  if (!isOpen) return null;

  const planLabels: Record<string, string> = {
    pro: "Pro",
    business: "Business",
    agence: "Agence",
  };

  const getLostFeatures = (from: string, to: string) => {
    if (from === "business" && to === "pro") {
      return [
        "Jusqu'à 3 établissements",
        "Gestion centralisée multi-établissements",
      ];
    }
    if (from === "agence" && (to === "pro" || to === "business")) {
      return [
        "Fonctionnalités avancées agence",
        "Support prioritaire niveau agence",
      ];
    }
    return ["Fonctionnalités avancées"];
  };

  const lostFeatures = getLostFeatures(currentPlan, targetPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-amber-300 mb-4">
          Tu vas perdre des fonctionnalités
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-xl">📉</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Passage de {planLabels[currentPlan]} à {planLabels[targetPlan]}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tu perds des fonctionnalités importantes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-xl">❌</span>
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-2">
                Fonctionnalités perdues :
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                {lostFeatures.map((feature, i) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-xl">⚙️</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Limitation de volumes
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Le plan {planLabels[targetPlan]} a des limites plus restrictives
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-xl">🤖</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Perte de l'automatisation complète
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Certaines fonctionnalités automatiques seront désactivées
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <span className="text-amber-400 text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Perte du support prioritaire
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Le support sera moins réactif avec le plan {planLabels[targetPlan]}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 shadow-lg shadow-emerald-500/30"
          >
            Rester sur mon plan actuel
          </Button>
          <Button
            onClick={onConfirm}
            variant="ghost"
            disabled={changingPlan}
            className="flex-1 text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-600 disabled:opacity-50"
          >
            {changingPlan ? "Changement..." : "Continuer le changement"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function FacturationPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const loadSubscription = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setSubscription(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await loadSubscription();

      // Vérifier si on revient d'un paiement réussi
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");

      if (success === "true" && !cancelled) {
        setSuccessMessage("🎉 Paiement réussi ! Mise à jour de votre abonnement...");
        
        // Polling pour attendre la mise à jour du webhook (max 10 tentatives, 2s entre chaque)
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          attempts++;
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || cancelled) {
            clearInterval(pollInterval);
            return;
          }

          const { data } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (data && data.plan !== "free" && data.status === "active") {
            setSubscription(data);
            setSuccessMessage("✅ Votre abonnement est maintenant actif !");
            
            // Déclencher un événement pour mettre à jour la sidebar immédiatement
            window.dispatchEvent(new CustomEvent("subscription-updated", { detail: data.plan }));
            
            // Forcer un refresh complet de la page pour s'assurer que tout est synchronisé
            setTimeout(() => {
              router.refresh();
              window.location.reload();
            }, 1500);
            
            clearInterval(pollInterval);
          } else if (attempts >= maxAttempts) {
            setSuccessMessage("⏳ Le paiement est en cours de traitement. Rafraîchissez la page dans quelques instants.");
            clearInterval(pollInterval);
            setTimeout(() => {
              router.replace("/app/facturation");
            }, 5000);
          }
        }, 2000);

        return () => {
          clearInterval(pollInterval);
        };
      } else if (canceled === "true" && !cancelled) {
        setSuccessMessage("❌ Paiement annulé");
        setTimeout(() => {
          router.replace("/app/facturation");
          setSuccessMessage(null);
        }, 3000);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;

    const planHierarchy: Record<string, number> = {
      free: 0,
      pro: 1,
      business: 2,
      agence: 3,
    };

    const currentPlan = subscription?.plan || "free";
    const currentPlanLevel = planHierarchy[currentPlan] || 0;
    const targetPlanLevel = planHierarchy[planId] || 0;
    const isDowngrade = targetPlanLevel < currentPlanLevel;

    // Si c'est un downgrade, afficher la modale anti-churn
    if (isDowngrade && subscription && subscription.plan !== "free") {
      setTargetPlan(planId);
      setShowDowngradeModal(true);
      return;
    }

    // Si c'est un upgrade ou nouveau plan, procéder normalement
    if (!subscription || subscription.plan === "free" || !subscription.stripe_subscription_id) {
      // Nouveau plan : utiliser checkout
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planId }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Erreur : " + (data.error || "Impossible de créer la session de paiement"));
        }
      } catch (err) {
        alert("Erreur lors de la redirection vers Stripe");
      }
    } else {
      // Upgrade : utiliser change-plan
      setChangingPlan(true);
      try {
        const response = await fetch("/api/billing/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetPlan: planId }),
        });

        const data = await response.json();
        if (data.success) {
          setSuccessMessage("✅ Plan mis à jour avec succès !");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          alert("Erreur lors du changement de plan : " + (data.error || "Erreur inconnue"));
        }
      } catch (err) {
        alert("Erreur lors du changement de plan");
      } finally {
        setChangingPlan(false);
      }
    }
  };

  const handleConfirmDowngrade = async () => {
    if (!targetPlan) return;

    setChangingPlan(true);
    try {
      const response = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("✅ Plan mis à jour avec succès !");
        setShowDowngradeModal(false);
        setTargetPlan(null);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Erreur lors du changement de plan : " + (data.error || "Erreur inconnue"));
      }
    } catch (err) {
      alert("Erreur lors du changement de plan");
    } finally {
      setChangingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const isCurrentPlan = (planId: string) => planId === subscription?.plan;

  // Hiérarchie des plans (du plus bas au plus haut)
  const planHierarchy: Record<string, number> = {
    free: 0,
    pro: 1,
    business: 2,
    agence: 3,
  };

  // Filtrer les plans : ne montrer que les plans supérieurs au plan actuel
  const currentPlanLevel = subscription?.plan ? planHierarchy[subscription.plan] || -1 : -1;
  const availablePlans = PLANS.filter(plan => {
    const planLevel = planHierarchy[plan.id] || -1;
    // Si l'utilisateur n'a pas de plan ou est sur "free", montrer tous les plans
    if (currentPlanLevel <= 0) return true;
    // Sinon, ne montrer que les plans supérieurs
    return planLevel > currentPlanLevel;
  });

  // Ordre pour mobile : Pro, Business, Free (mais seulement ceux disponibles)
  const plansOrder = ["pro", "business", "free"];
  const orderedPlans = plansOrder
    .map(id => availablePlans.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto">
      {/* Header sobre */}
      <div className="flex-shrink-0 pt-8 pb-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 text-center mb-2">
            Chaque avis non répondu te fait perdre de l'argent
          </h1>
          
          {/* Message de succès après paiement */}
          {successMessage && (
            <div className="mt-4 mx-auto max-w-md">
              <div className={`p-4 rounded-lg border ${
                successMessage.includes("✅") 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : successMessage.includes("⏳")
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <p className="text-sm font-medium text-center">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Plan actuel compact */}
          {subscription && subscription.plan !== "free" && (
            <div className="text-center mt-4">
              <p className="text-xs text-slate-400">
                Plan actuel : <span className="text-slate-300 font-medium capitalize">{subscription.plan}</span>
                {" • "}
                <button
                  onClick={() => router.push("/app/gestion")}
                  className="text-slate-300 hover:text-slate-200 underline"
                >
                  Gérer
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cartes - Desktop: 3 colonnes, Mobile: Pro en premier */}
      <div className="flex-1 px-4 md:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Message si l'utilisateur a déjà le plan le plus élevé */}
          {availablePlans.length === 0 && subscription && subscription.plan !== "free" && (
            <div className="text-center py-12">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-lg font-semibold text-emerald-300 mb-2">
                  ✅ Vous avez déjà le plan le plus élevé
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Vous bénéficiez de toutes les fonctionnalités disponibles avec le plan <span className="font-medium capitalize">{subscription.plan}</span>.
                </p>
                <button
                  onClick={() => router.push("/app/gestion")}
                  className="text-sm text-emerald-300 hover:text-emerald-200 underline"
                >
                  Gérer mon abonnement
                </button>
              </div>
            </div>
          )}

          {/* Desktop: 3 colonnes côte à côte */}
          {availablePlans.length > 0 && (
          <div className="hidden md:flex items-stretch justify-center gap-6">
            {availablePlans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.id);
              const isProPlan = plan.id === "pro";
              const isFreePlan = plan.id === "free";

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col bg-slate-900/80 border ${
                    isProPlan
                      ? "flex-[1.15] border-slate-600/50 shadow-lg shadow-slate-900/50"
                      : isFreePlan
                      ? "flex-[0.85] border-slate-800/50 opacity-60"
                      : "flex-1 border-slate-700/50"
                  } rounded-xl transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Badge Pro - Angle haut droit */}
                  {isProPlan && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-slate-800/90 text-slate-200 border border-slate-700/50 text-xs font-medium px-3 py-1">
                        Le plus utilisé par les professionnels
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col h-full p-6">
                    {/* Nom du plan */}
                    <h3 className={`mb-4 ${
                      isProPlan ? "text-xl font-semibold text-slate-50" 
                      : isFreePlan ? "text-base font-medium text-slate-500" 
                      : "text-lg font-semibold text-slate-200"
                    }`}>
                      {plan.name}
                    </h3>

                    {/* Prix */}
                    <div className="mb-6">
                      <p className={`${
                        isProPlan ? "text-5xl font-bold text-slate-50" 
                        : isFreePlan ? "text-2xl font-semibold text-slate-500" 
                        : "text-4xl font-bold text-slate-200"
                      } leading-none`}>
                        {plan.price}
                        <span className={`${
                          isProPlan ? "text-lg" : "text-sm"
                        } text-slate-400 font-normal ml-2`}>/mois</span>
                      </p>
                      {plan.priceNote && (
                        <p className="text-xs text-slate-400 mt-2">{plan.priceNote}</p>
                      )}
                    </div>

                    {/* Bénéfices */}
                    <ul className="flex-1 space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`${
                            isProPlan ? "text-slate-400" 
                            : isFreePlan ? "text-slate-600" 
                            : "text-slate-500"
                          } text-sm mt-0.5 flex-shrink-0`}>
                            {isFreePlan ? "○" : "✓"}
                          </span>
                          <span className={`${
                            isProPlan ? "text-sm text-slate-300" 
                            : isFreePlan ? "text-xs text-slate-500" 
                            : "text-sm text-slate-400"
                          } leading-relaxed`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Bouton */}
                    <div className="mt-auto">
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrent}
                        className={`w-full ${
                          isProPlan 
                            ? "w-[80%] mx-auto bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-600/50 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-900/30 transition-all duration-200 hover:-translate-y-0.5"
                            : isFreePlan
                            ? "bg-slate-900/50 text-slate-500 border border-slate-800/50 hover:bg-slate-900/70"
                            : "bg-slate-800/70 text-slate-200 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-50"
                        } h-12 font-medium transition-all duration-200`}
                      >
                        {isCurrent ? "Plan actuel" : plan.cta}
                      </Button>
                      
                      {/* Réassurance Pro uniquement */}
                      {isProPlan && !isCurrent && (
                        <p className="text-xs text-slate-500 text-center mt-3">
                          Sans engagement • Résiliable en 1 clic • Paiement sécurisé
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}

          {/* Mobile: Pro en premier, vertical */}
          {availablePlans.length > 0 && (
          <div className="md:hidden space-y-6">
            {orderedPlans.map((plan) => {
              const isCurrent = isCurrentPlan(plan!.id);
              const isProPlan = plan!.id === "pro";
              const isFreePlan = plan!.id === "free";

              return (
                <Card
                  key={plan!.id}
                  className={`relative flex flex-col bg-slate-900/80 border ${
                    isProPlan
                      ? "border-slate-600/50 shadow-lg"
                      : isFreePlan
                      ? "border-slate-800/50 opacity-60"
                      : "border-slate-700/50"
                  } rounded-xl`}
                >
                  {/* Badge Pro - Angle haut droit */}
                  {isProPlan && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-slate-800/90 text-slate-200 border border-slate-700/50 text-xs font-medium px-3 py-1">
                        Le plus utilisé par les professionnels
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col p-6">
                    {/* Nom du plan */}
                    <h3 className={`mb-4 ${
                      isProPlan ? "text-xl font-semibold text-slate-50" 
                      : isFreePlan ? "text-base font-medium text-slate-500" 
                      : "text-lg font-semibold text-slate-200"
                    }`}>
                      {plan!.name}
                    </h3>

                    {/* Prix */}
                    <div className="mb-6">
                      <p className={`${
                        isProPlan ? "text-5xl font-bold text-slate-50" 
                        : isFreePlan ? "text-2xl font-semibold text-slate-500" 
                        : "text-4xl font-bold text-slate-200"
                      } leading-none`}>
                        {plan!.price}
                        <span className={`${
                          isProPlan ? "text-lg" : "text-sm"
                        } text-slate-400 font-normal ml-2`}>/mois</span>
                      </p>
                      {plan!.priceNote && (
                        <p className="text-xs text-slate-400 mt-2">{plan!.priceNote}</p>
                      )}
                    </div>

                    {/* Bénéfices */}
                    <ul className="space-y-3 mb-6">
                      {plan!.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`${
                            isProPlan ? "text-slate-400" 
                            : isFreePlan ? "text-slate-600" 
                            : "text-slate-500"
                          } text-sm mt-0.5 flex-shrink-0`}>
                            {isFreePlan ? "○" : "✓"}
                          </span>
                          <span className={`${
                            isProPlan ? "text-sm text-slate-300" 
                            : isFreePlan ? "text-xs text-slate-500" 
                            : "text-sm text-slate-400"
                          } leading-relaxed`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Bouton */}
                    <div>
                      <Button
                        onClick={() => handleUpgrade(plan!.id)}
                        disabled={isCurrent}
                        className={`w-full ${
                          isProPlan 
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-600/50 hover:border-slate-500 hover:shadow-lg transition-all duration-200"
                            : isFreePlan
                            ? "bg-slate-900/50 text-slate-500 border border-slate-800/50"
                            : "bg-slate-800/70 text-slate-200 border border-slate-700/50 hover:bg-slate-800"
                        } h-14 font-medium text-base`}
                      >
                        {isCurrent ? "Plan actuel" : plan!.cta}
                      </Button>
                      
                      {/* Réassurance Pro uniquement */}
                      {isProPlan && !isCurrent && (
                        <p className="text-xs text-slate-500 text-center mt-3">
                          Sans engagement • Résiliable en 1 clic • Paiement sécurisé
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Modale de downgrade */}
      {subscription && targetPlan && (
        <DowngradeModal
          isOpen={showDowngradeModal}
          onClose={() => {
            setShowDowngradeModal(false);
            setTargetPlan(null);
          }}
          onConfirm={handleConfirmDowngrade}
          currentPlan={subscription.plan}
          targetPlan={targetPlan}
          changingPlan={changingPlan}
        />
      )}
    </div>
  );
}
