"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionStats {
  plan: string;
  protectionActive: boolean;
  avisProtegesCeMois: number;
  tempsEconomise: number;
  tauxReponseGlobal: number;
  avisTraitesAuto: number;
  avisNegatifsNeutralises: number;
  reponsesPubliees: number;
  derniereActionIA: string | null;
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return "Aucune";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    business: "Business",
    agence: "Agence",
  };
  return labels[plan] || plan;
}

// Composant AnimatedCounter pour les compteurs animés
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(Math.floor(current));

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
}

// Modale de résiliation
function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  stats,
  cancelling = false,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  stats: SubscriptionStats;
  cancelling?: boolean;
}) {
  if (!isOpen) return null;

  const pertes = {
    avisNonTraites: stats.avisProtegesCeMois,
    tempsManuel: stats.tempsEconomise,
    baisseTauxReponse: Math.max(0, stats.tauxReponseGlobal - 30),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="bg-slate-900 border-2 border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-red-300 mb-4">
          Tu vas perdre ta protection automatique
        </h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-300">
                {pertes.avisNonTraites} avis ne seront plus traités automatiquement
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tu devras répondre manuellement à chaque nouvel avis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400 text-xl">⏱️</span>
            <div>
              <p className="text-sm font-semibold text-red-300">
                ~{pertes.tempsManuel} minutes par mois à reprendre manuellement
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Temps que tu économisais avec l'automatisation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400 text-xl">📉</span>
            <div>
              <p className="text-sm font-semibold text-red-300">
                Baisse estimée du taux de réponse : {stats.tauxReponseGlobal}% → ~{pertes.baisseTauxReponse}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Risque de perte de clients à cause d'avis non répondu
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-red-400 text-xl">🛡️</span>
            <div>
              <p className="text-sm font-semibold text-red-300">
                Désactivation immédiate de la protection IA
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ton image ne sera plus protégée automatiquement
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mb-6 italic">
          90 % de nos clients gardent la protection après avoir vu l'impact réel.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 shadow-lg shadow-emerald-500/30"
          >
            Garder ma protection
          </Button>
          <Button
            onClick={onConfirm}
            variant="ghost"
            disabled={cancelling}
            className="flex-1 text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-600 disabled:opacity-50"
          >
            {cancelling ? "Annulation..." : "Continuer la résiliation"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function GestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubscriptionStats>({
    plan: "free",
    protectionActive: false,
    avisProtegesCeMois: 0,
    tempsEconomise: 0,
    tauxReponseGlobal: 0,
    avisTraitesAuto: 0,
    avisNegatifsNeutralises: 0,
    reponsesPubliees: 0,
    derniereActionIA: null,
  });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [subscription, setSubscription] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        // Charger les données depuis l'API summary
        const response = await fetch("/api/billing/summary");
        if (!response.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = await response.json();

        // Rediriger les utilisateurs Free
        if (!isPaidPlan(data.subscription.plan)) {
          router.push("/app/facturation");
          return;
        }

        if (!cancelled) {
          setSubscription(data.subscription);
          setStats({
            plan: data.subscription.plan,
            protectionActive: data.metrics.protectionActive,
            avisProtegesCeMois: data.metrics.avisProtegesCeMois,
            tempsEconomise: data.metrics.tempsEconomise,
            tauxReponseGlobal: data.metrics.tauxReponseGlobal,
            avisTraitesAuto: data.metrics.avisTraitesAuto,
            avisNegatifsNeutralises: data.metrics.avisNegatifsNeutralises,
            reponsesPubliees: data.metrics.reponsesPubliees,
            derniereActionIA: data.metrics.derniereActionIA
              ? formatTimeAgo(new Date(data.metrics.derniereActionIA))
              : null,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    // Rafraîchir toutes les 4 secondes pour les animations live
    const refreshInterval = setInterval(() => {
      if (!cancelled) {
        loadData();
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [router]);

  const handleOpenStripePortal = async () => {
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert("Erreur lors de l'ouverture du portail Stripe");
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atPeriodEnd: true }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage("✅ " + data.message);
        setShowCancelModal(false);
        // Recharger les données
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Erreur lors de l'annulation : " + (data.error || "Erreur inconnue"));
      }
    } catch (err) {
      alert("Erreur lors de l'annulation de l'abonnement");
    } finally {
      setCancelling(false);
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch("/api/billing/resume", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("✅ " + data.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Erreur lors de la reprise : " + (data.error || "Erreur inconnue"));
      }
    } catch (err) {
      alert("Erreur lors de la reprise de l'abonnement");
    }
  };


  // Afficher le loading ou rediriger si pas de plan payant
  if (loading || !isPaidPlan(stats.plan)) {
    // Si on a déjà chargé et que ce n'est pas un plan payant, la redirection est en cours
    if (!loading && !isPaidPlan(stats.plan)) {
      return null; // Ne rien afficher pendant la redirection
    }
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-950">
      {/* A. Bloc statut temps réel */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 border-b border-indigo-500/30 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-6">
            Gestion de l'abonnement
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Plan actuel</div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-sm font-semibold">
                {getPlanLabel(stats.plan)}
              </Badge>
            </Card>

            <Card className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Protection IA</div>
              <div className={`text-lg font-bold ${stats.protectionActive ? "text-emerald-300" : "text-slate-500"}`}>
                {stats.protectionActive ? "Active" : "Inactive"}
              </div>
            </Card>

            <Card className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Avis protégés ce mois</div>
              <div className="text-lg font-bold text-slate-50">
                <AnimatedCounter value={stats.avisProtegesCeMois} />
              </div>
            </Card>

            <Card className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Temps économisé</div>
              <div className="text-lg font-bold text-slate-50">
                <AnimatedCounter value={stats.tempsEconomise} suffix=" min" />
              </div>
            </Card>

            <Card className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Taux de réponse</div>
              <div className="text-lg font-bold text-slate-50">
                <AnimatedCounter value={stats.tauxReponseGlobal} suffix="%" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Message de succès */}
        {successMessage && (
          <div className="max-w-7xl mx-auto">
            <Card className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-300 text-center">{successMessage}</p>
            </Card>
          </div>
        )}

        {/* Message si annulation en cours */}
        {subscription && subscription.status === "cancel_at_period_end" && subscription.plan === "free" && (
          <div className="max-w-7xl mx-auto">
            <Card className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">
                    ⚠️ Votre abonnement a été résilié - Accès aux fonctionnalités payantes retiré
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-amber-400">
                      L'annulation définitive sera effective le : {new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Vous pouvez reprendre votre abonnement pour retrouver l'accès immédiatement
                  </p>
                </div>
                <Button
                  onClick={handleResume}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2"
                >
                  Reprendre l'abonnement
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* B. Bloc bénéfices actifs */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Bénéfices actifs ce mois-ci</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Avis traités automatiquement",
                value: stats.avisTraitesAuto,
                icon: "⚡",
              },
              {
                title: "Avis négatifs neutralisés",
                value: stats.avisNegatifsNeutralises,
                icon: "🛡️",
              },
              {
                title: "Réponses publiées",
                value: stats.reponsesPubliees,
                icon: "📝",
              },
              {
                title: "Dernière action IA",
                value: stats.derniereActionIA || "Aucune",
                icon: "🔄",
                isText: true,
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-emerald-500/30 rounded-xl shadow-premium p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{benefit.icon}</div>
                  {!benefit.isText && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-2 font-medium">{benefit.title}</div>
                <div className="text-xl font-bold text-emerald-300">
                  {benefit.isText ? benefit.value : <AnimatedCounter value={benefit.value as number} />}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* C. Bloc gestion de l'abonnement */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Gestion de l'abonnement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/app/facturation")}
              className="h-auto py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Changer de plan
            </Button>

            <Button
              onClick={() => setShowCancelModal(true)}
              className="h-auto py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              Résilier l'abonnement
            </Button>
          </div>
        </div>

        {/* D. Bloc sécurité & engagement */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Sécurité & engagement</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Paiement sécurisé",
              "Résiliation en 1 clic",
              "Aucune donnée conservée inutilement",
              "Support prioritaire plan payant",
            ].map((badge, index) => (
              <Badge
                key={index}
                className="bg-slate-800/50 text-slate-300 border border-slate-700/50 text-sm px-4 py-2"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>

      </div>

      {/* Modale de résiliation */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        stats={stats}
        cancelling={cancelling}
      />
    </div>
  );
}

