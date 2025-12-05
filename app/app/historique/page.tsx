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
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    contenu_avis: "",
    note: 5,
    author_name: "",
  });
  const [creatingReview, setCreatingReview] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number; limit: number; used: number } | null>(null);

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

      // Charger le profil business pour générer des réponses
      const { data: profile } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      
      if (!cancelled && profile) {
        setBusinessProfile(profile);
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

  const handleGenerateResponse = async (review: Review) => {
    if (!businessProfile) {
      alert("Profil établissement requis. Veuillez compléter votre profil.");
      return;
    }

    setGeneratingId(review.id);
    try {
      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenu_avis: review.contenu_avis,
          note: review.note || undefined,
          business_id: businessProfile.id,
          review_id: review.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Plan gratuit") {
          alert("La génération automatique de réponse n'est pas disponible avec le plan gratuit. Passez au plan Pro pour activer cette fonctionnalité !");
        } else if (error.error === "Quota atteint") {
          alert(`Vous avez atteint votre limite de ${error.limit} réponses ce mois. Passez au plan Pro pour des réponses illimitées !`);
        } else {
          alert(`Erreur : ${error.error || error.message || "Impossible de générer la réponse"}`);
        }
        setGeneratingId(null);
        return;
      }

      const data = await response.json();
      
      // Recharger les avis pour afficher la nouvelle réponse
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: updatedReviews } = await supabase
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
        
        if (updatedReviews) {
          setReviews(updatedReviews as Review[]);
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      alert("Erreur lors de la génération de la réponse");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleCreateReview = async () => {
    if (!businessProfile) {
      alert("Profil établissement requis. Veuillez compléter votre profil.");
      return;
    }

    if (!newReview.contenu_avis.trim()) {
      alert("Le contenu de l'avis est requis");
      return;
    }

    setCreatingReview(true);
    try {
      const response = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessProfile.id,
          contenu_avis: newReview.contenu_avis,
          note: newReview.note,
          author_name: newReview.author_name || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || error.error || "Erreur lors de la création de l'avis");
        setCreatingReview(false);
        return;
      }

      const data = await response.json();
      
      // Mettre à jour le quota
      if (data.quota) {
        setQuotaInfo(data.quota);
      }

      // Réinitialiser le formulaire
      setNewReview({
        contenu_avis: "",
        note: 5,
        author_name: "",
      });
      setShowAddReviewModal(false);

      // Recharger les avis
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: updatedReviews } = await supabase
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
        
        if (updatedReviews) {
          setReviews(updatedReviews as Review[]);
        }
      }
    } catch (error) {
      console.error("Error creating review:", error);
      alert("Erreur lors de la création de l'avis");
    } finally {
      setCreatingReview(false);
    }
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
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
              {totalAvis} avis traités
            </Badge>
            <button
              onClick={() => setShowAddReviewModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Ajouter un avis
            </button>
          </div>
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

                  {/* Ligne 3 : Date + Boutons */}
                  <div className="flex items-center justify-between flex-shrink-0 gap-2">
                    <span className="text-xs text-slate-400">{dateStr}</span>
                    <div className="flex gap-2">
                      {hasResponse ? (
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
                      ) : (
                        <Button
                          onClick={() => handleGenerateResponse(review)}
                          variant="outline"
                          size="sm"
                          disabled={generatingId === review.id}
                          className="h-7 text-xs px-3 border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-50"
                        >
                          {generatingId === review.id ? "Génération..." : "Générer une réponse"}
                        </Button>
                      )}
                    </div>
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

          {/* Message pour plan gratuit avec incitation Pro */}
          {!isPaidPlan(userPlan) && (
            <Card className="bg-gradient-to-br from-indigo-500/10 to-slate-950/95 border border-indigo-500/30 rounded-xl shadow-premium p-4">
              <h3 className="text-sm font-bold text-indigo-300 mb-3 flex items-center gap-2">
                <span>⭐</span>
                <span>Passe au plan Pro</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">
                  En version gratuite, tu peux générer jusqu'à <strong className="text-indigo-300">5 réponses IA par mois</strong>.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 border border-slate-700/50">
                  <p className="font-semibold text-indigo-300">Avec le plan Pro :</p>
                  <ul className="space-y-1 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Les avis arrivent <strong>automatiquement</strong> depuis Google</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>L'IA répond <strong>automatiquement</strong> à tous tes avis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Réponses <strong>illimitées</strong> chaque mois</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>Publication automatique sur Google</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="/app/facturation"
                  className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  Découvrir le plan Pro
                </a>
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

      {/* Modal pour ajouter un avis */}
      {showAddReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-50">Ajouter un avis manuel</h2>
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {userPlan === "free" && quotaInfo && (
              <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-sm text-indigo-300">
                  Plan gratuit : {quotaInfo.remaining} avis manuels restants ce mois (sur {quotaInfo.limit})
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Note (1-5)
                </label>
                <select
                  value={newReview.note}
                  onChange={(e) => setNewReview({ ...newReview, note: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value={5}>5 ⭐</option>
                  <option value={4}>4 ⭐</option>
                  <option value={3}>3 ⭐</option>
                  <option value={2}>2 ⭐</option>
                  <option value={1}>1 ⭐</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contenu de l'avis *
                </label>
                <textarea
                  value={newReview.contenu_avis}
                  onChange={(e) => setNewReview({ ...newReview, contenu_avis: e.target.value })}
                  placeholder="Saisis le contenu de l'avis..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom de l'auteur (optionnel)
                </label>
                <input
                  type="text"
                  value={newReview.author_name}
                  onChange={(e) => setNewReview({ ...newReview, author_name: e.target.value })}
                  placeholder="Nom du client"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCreateReview}
                  disabled={creatingReview || !newReview.contenu_avis.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {creatingReview ? "Création..." : "Créer l'avis"}
                </Button>
                <Button
                  onClick={() => setShowAddReviewModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
