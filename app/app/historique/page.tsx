"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  contenu_avis: string;
  note: number | null;
  source: string;
  created_at: string;
  author_name: string | null;
  ai_responses: Array<{
    reponse_generee: string;
    ton_utilise: string;
  }>;
}

// Helper pour vérifier si un plan est payant (pro, business, agence)
function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

export default function HistoriquePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
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
      
      if (!cancelled) {
        setUserPlan(subscription?.plan || "free");
      }

      const { data } = await supabase
        .from("reviews")
        .select(`
          *,
          ai_responses (
            reponse_generee,
            ton_utilise
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!cancelled) {
        if (data) {
          setReviews(data as Review[]);
        }
        setLoading(false);
      }
    };
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  // Rafraîchir les données toutes les 30 secondes pour mettre à jour les indicateurs
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();
      
      setUserPlan(subscription?.plan || "free");

      const { data } = await supabase
        .from("reviews")
        .select(`
          *,
          ai_responses (
            reponse_generee,
            ton_utilise
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setReviews(data as Review[]);
      }
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const getSentiment = (note: number | null): "positive" | "neutral" | "negative" => {
    if (!note) return "neutral";
    if (note >= 4) return "positive";
    if (note <= 2) return "negative";
    return "neutral";
  };

  const handleCopy = async (review: Review) => {
    if (!review.ai_responses || review.ai_responses.length === 0) return;
    
    await navigator.clipboard.writeText(review.ai_responses[0].reponse_generee);
    setCopySuccessId(review.id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  const truncateText = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculer les statistiques
  const totalAvis = reviews.length;
  const avisNegatifs = reviews.filter(r => r.note !== null && r.note <= 2).length;
  const avisPositifs = reviews.filter(r => r.note !== null && r.note >= 4).length;
  const avisNegatifsNeutralises = reviews.filter(r => r.note !== null && r.note <= 2 && r.ai_responses && r.ai_responses.length > 0).length;
  const avisAvecReponse = reviews.filter(r => r.ai_responses && r.ai_responses.length > 0).length;
  const tauxReponseGlobal = totalAvis > 0 ? Math.round((avisAvecReponse / totalAvis) * 100) : 0;
  const aucunAvisSansReponse = totalAvis === 0 || avisAvecReponse === totalAvis;
  const pourcentageNegatifs = totalAvis > 0 ? Math.round((avisNegatifs / totalAvis) * 100) : 0;
  const pourcentagePositifs = totalAvis > 0 ? Math.round((avisPositifs / totalAvis) * 100) : 0;
  
  // Calculer le temps économisé (5 min par réponse)
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const avisCeMois = reviews.filter(r => new Date(r.created_at) >= debutMois);
  const avisTraitesCeMois = avisCeMois.filter(r => r.ai_responses && r.ai_responses.length > 0);
  const tempsEconomise = avisTraitesCeMois.length * 5;

  // Distribution par note
  const distribution = {
    5: reviews.filter(r => r.note === 5).length,
    4: reviews.filter(r => r.note === 4).length,
    3: reviews.filter(r => r.note === 3).length,
    2: reviews.filter(r => r.note === 2).length,
    1: reviews.filter(r => r.note === 1).length,
  };

  const maxDistribution = Math.max(...Object.values(distribution));

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

  return (
    <div className="h-full flex flex-col">
      {/* En-tête compact */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-50">Historique AvisPro</h1>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
            {totalAvis} avis traités
          </Badge>
        </div>
        <p className="text-sm text-slate-400">
          Toutes tes réponses générées, prêtes à être réutilisées en 1 clic.
        </p>
      </div>

      {/* Structure en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 min-h-0 overflow-y-auto">
        {/* Colonne centrale - Liste des avis */}
        <div className="space-y-3 min-h-0">
          {reviews.length === 0 ? (
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-8 text-center">
              <p className="text-slate-400">Aucun avis pour le moment</p>
            </Card>
          ) : (
            reviews.map((review) => {
              const sentiment = getSentiment(review.note);
              const isNegative = review.note !== null && review.note <= 2;
              const isPositive = review.note !== null && review.note >= 4;
              const hasResponse = review.ai_responses && review.ai_responses.length > 0;
              const reviewDate = new Date(review.created_at);
              const dateStr = reviewDate.toLocaleDateString("fr-FR", { 
                day: "numeric", 
                month: "short",
                year: reviewDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
              });

              return (
                <Card
                  key={review.id}
                  className={`bg-gradient-to-br from-slate-900/95 to-slate-950/95 border rounded-xl shadow-premium p-4 h-28 flex flex-col justify-between transition-all duration-200 ${
                    isNegative
                      ? "border-rose-500/40 bg-gradient-to-br from-rose-500/10 to-slate-950/95"
                      : "border-slate-700/60"
                  }`}
                >
                  {/* Ligne 1 : Pseudo avec avatar */}
                  <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                      👤
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {review.author_name || "Utilisateur Google"}
                    </span>
                  </div>

                  {/* Ligne 2 : Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    {review.note && (
                      <Badge className="text-xs px-2 py-0.5">
                        {"★".repeat(review.note)}{"☆".repeat(5 - review.note)}
                      </Badge>
                    )}
                    {isNegative && (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs px-2 py-0.5">
                        Négatif
                      </Badge>
                    )}
                    {sentiment === "neutral" && review.note === 3 && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-2 py-0.5">
                        Neutre
                      </Badge>
                    )}
                    {isPositive && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2 py-0.5">
                        Positif
                      </Badge>
                    )}
                    {hasResponse && (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs px-2 py-0.5">
                        Réponse générée
                      </Badge>
                    )}
                  </div>

                  {/* Ligne 3 : Texte de l'avis (1-2 lignes max) */}
                  <p className={`text-sm mb-2 line-clamp-2 flex-1 ${isNegative ? "text-slate-100" : "text-slate-200"}`}>
                    {truncateText(review.contenu_avis, 120)}
                  </p>

                  {/* Ligne 3 : Date + Bouton */}
                  <div className="flex items-center justify-between flex-shrink-0">
                    <span className="text-xs text-slate-400">{dateStr}</span>
                    {hasResponse && (
                      <Button
                        onClick={() => handleCopy(review)}
                        variant="outline"
                        size="sm"
                        className={`h-7 text-xs px-3 ${
                          copySuccessId === review.id
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        {copySuccessId === review.id ? "✓ Copié" : "Copier la réponse"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Colonne de droite - Tableau de bord */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          {/* Indicateurs de réassurance pour plans payants */}
          {isPaidPlan(userPlan) && (
            <Card className="bg-gradient-to-br from-emerald-500/10 to-slate-950/95 border border-emerald-500/30 rounded-xl shadow-premium p-4">
              <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
                <span>✓</span>
                <span>Protection active</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Avis négatifs neutralisés</span>
                  <span className="font-bold">{avisNegatifsNeutralises}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Temps économisé ce mois</span>
                  <span className="font-bold">{tempsEconomise} min</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Taux de réponse global</span>
                  <span className="font-bold">{tauxReponseGlobal}%</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Aucun avis sans réponse</span>
                  <span className="font-bold">{aucunAvisSansReponse ? "✓" : "⚠️"}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Indicateurs verrouillés pour plan gratuit */}
          {!isPaidPlan(userPlan) && (
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800/60 rounded-xl shadow-premium p-4 opacity-60">
              <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                <span>🔒</span>
                <span>Protection active</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Avis négatifs neutralisés</span>
                  <span>🔒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Temps économisé ce mois</span>
                  <span>🔒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taux de réponse global</span>
                  <span>🔒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Aucun avis sans réponse</span>
                  <span>🔒</span>
                </div>
                <p className="text-xs text-slate-500 italic mt-2">Disponible uniquement en plan payant</p>
              </div>
            </Card>
          )}

          {/* Bloc 1 - Résumé rapide */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Résumé rapide</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Total d'avis</div>
                <div className="text-2xl font-bold text-slate-50">{totalAvis}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">% Négatifs</div>
                <div className="text-xl font-bold text-rose-400">{pourcentageNegatifs}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">% Positifs</div>
                <div className="text-xl font-bold text-emerald-400">{pourcentagePositifs}%</div>
              </div>
            </div>
          </Card>

          {/* Bloc 2 - Typologie */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Typologie</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((note) => {
                const count = distribution[note as keyof typeof distribution];
                const width = maxDistribution > 0 ? (count / maxDistribution) * 100 : 0;
                return (
                  <div key={note} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-6">{note}★</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          note >= 4
                            ? "bg-emerald-500"
                            : note === 3
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bloc 3 - Conseil dynamique */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Conseil</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {avisNegatifs > 0
                ? "Réponds rapidement aux avis négatifs pour protéger ton image."
                : avisPositifs > 0
                ? "Continue à valoriser les avis positifs pour renforcer ta réputation."
                : "Commence à répondre aux avis pour améliorer ta visibilité."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
