"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";

interface Review {
  id: string;
  contenu_avis: string;
  note: number | null;
  created_at: string;
  status: string;
  business_id: string;
  author_name: string | null;
}

interface AIResponse {
  id: string;
  reponse_generee: string;
  ton_utilise: string;
}

// Helper pour vérifier si un plan est payant (pro, business, agence)
function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

export default function ValiderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [remainingCount, setRemainingCount] = useState(0);
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [processedReviewIds, setProcessedReviewIds] = useState<Set<string>>(new Set());
  const processedReviewIdsRef = useRef<Set<string>>(new Set());
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [reassuranceStats, setReassuranceStats] = useState({
    avisTraitesAuto: 0,
    avisNegatifsNeutralises: 0,
    tempsEconomise: 0,
    tauxReponseGlobal: 0,
    aucunAvisSansReponse: true,
  });

  // Charger le plan de l'utilisateur
  const loadUserPlan = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (subscription) {
      setUserPlan(subscription.plan || "free");
    }
  };

  // Charger les statistiques de réassurance
  const loadReassuranceStats = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: allReviews } = await supabase
      .from("reviews")
      .select("*, ai_responses(id)")
      .eq("user_id", user.id);

    if (!allReviews) return;

    const avisCeMois = allReviews.filter((r) => new Date(r.created_at) >= debutMois);
    const avisTraitesCeMois = avisCeMois.filter((r) => r.ai_responses && r.ai_responses.length > 0);
    const avisNegatifs = allReviews.filter((r) => r.note !== null && r.note <= 2);
    const avisNegatifsNeutralises = avisNegatifs.filter((r) => r.ai_responses && r.ai_responses.length > 0).length;
    const avisAvecReponse = allReviews.filter((r) => r.ai_responses && r.ai_responses.length > 0);
    const tauxReponseGlobal = allReviews.length > 0 ? Math.round((avisAvecReponse.length / allReviews.length) * 100) : 0;
    const aucunAvisSansReponse = allReviews.length === 0 || avisAvecReponse.length === allReviews.length;
    const tempsEconomise = avisTraitesCeMois.length * 5;

    setReassuranceStats({
      avisTraitesAuto: avisTraitesCeMois.length,
      avisNegatifsNeutralises,
      tempsEconomise,
      tauxReponseGlobal,
      aucunAvisSansReponse,
    });
  };

  // Charger le prochain avis à valider
  const loadNextReview = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Charger les stats de réassurance
      await loadReassuranceStats();

      // Réinitialiser les états
      setAiResponse(null);
      setShowFullResponse(false);

      // Récupérer tous les avis avec leur statut
      // On va filtrer les avis "publié" après, de manière robuste
      const { data: allReviews, error: fetchError } = await supabase
        .from("reviews")
        .select("id, contenu_avis, note, created_at, business_id, author_name, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (fetchError) {
        console.error("Error loading reviews:", fetchError);
        setLoading(false);
        return;
      }

      if (!allReviews || allReviews.length === 0) {
        setCurrentReview(null);
        setRemainingCount(0);
        setLoading(false);
        return;
      }

      // Vérifier quels avis ont déjà une réponse et déterminer leur statut
      // Utiliser la ref pour avoir la valeur la plus récente (évite les problèmes de closure)
      const currentProcessedIds = processedReviewIdsRef.current;
      const reviewsWithStatus = await Promise.all(
        allReviews.map(async (r) => {
          // Exclure d'abord les avis déjà traités (copiés) même si le statut n'est pas mis à jour
          if (currentProcessedIds.has(r.id)) {
            console.log(`Excluding processed review: ${r.id}`);
            return null;
          }

          const { data: response } = await supabase
            .from("ai_responses")
            .select("id")
            .eq("review_id", r.id)
            .maybeSingle();

          // Utiliser le statut de l'avis s'il est déjà chargé, sinon le récupérer
          let status: string | null = (r as any).status || null;
          
          // Si le statut n'est pas dans les données chargées, le récupérer
          if (!status) {
            try {
              const { data: reviewWithStatus } = await supabase
                .from("reviews")
                .select("status")
                .eq("id", r.id)
                .maybeSingle();
              status = reviewWithStatus?.status || null;
            } catch (e) {
              status = null;
            }
          }

          // Si toujours pas de statut, le déterminer selon la présence d'une réponse
          if (!status) {
            status = response ? "reponse_prête" : "nouveau";
          }

          // Exclure TOUJOURS les avis publiés ou ignorés (même si la requête SQL n'a pas filtré)
          if (status === "publié" || status === "ignoré") {
            console.log(`Excluding review ${r.id} with status: ${status}`);
            return null;
          }

          return { review: { ...r, status }, status, hasResponse: !!response };
        })
      );

      // Filtrer et trier : négatifs d'abord, puis par date
      const validReviews = reviewsWithStatus
        .filter((item): item is { review: Review; status: string; hasResponse: boolean } => item !== null)
        .filter(({ status }) => status === "nouveau" || status === "reponse_prête")
        .sort((a, b) => {
          const aNote = a.review.note || 0;
          const bNote = b.review.note || 0;
          if (aNote <= 2 && bNote > 2) return -1;
          if (aNote > 2 && bNote <= 2) return 1;
          return new Date(a.review.created_at).getTime() - new Date(b.review.created_at).getTime();
        });

      console.log(`Found ${validReviews.length} reviews to validate (total: ${allReviews.length}, processed: ${processedReviewIds.size})`);

      const reviews = validReviews[0]?.review || null;

      if (reviews) {
        const reviewStatus = validReviews[0]?.status || "nouveau";
        setCurrentReview({ ...reviews, status: reviewStatus });

        const { data: response } = await supabase
          .from("ai_responses")
          .select("id, reponse_generee, ton_utilise")
          .eq("review_id", reviews.id)
          .maybeSingle();

        if (response) {
          setAiResponse(response);
          if (reviewStatus === "nouveau") {
            try {
              await supabase
                .from("reviews")
                .update({ status: "reponse_prête" })
                .eq("id", reviews.id);
            } catch (e) {
              // Ignorer si le champ n'existe pas
            }
          }
        } else {
          await generateResponse(reviews);
        }
      } else {
        setCurrentReview(null);
      }

      // Mettre à jour le compteur AVANT de désactiver le loading
      setRemainingCount(validReviews.length);
      setLoading(false);
    } catch (error) {
      console.error("Error in loadNextReview:", error);
      setLoading(false);
    }
  };

  // Générer automatiquement la réponse
  const generateResponse = async (review: Review) => {
    setGenerating(true);
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("business_profiles")
        .select("metier, nom_etablissement, ville, ton_marque")
        .eq("id", review.business_id)
        .single();

      if (!profile) {
        console.error("Business profile not found");
        setGenerating(false);
        return;
      }

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("business_id")
        .eq("id", review.id)
        .single();

      if (!reviewData) {
        console.error("Review data not found");
        setGenerating(false);
        return;
      }

      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenu_avis: review.contenu_avis,
          note: review.note || undefined,
          business_id: reviewData.business_id,
          review_id: review.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error generating response:", error);
        setGenerating(false);
        return;
      }

      const data = await response.json();

      const { data: savedResponse } = await supabase
        .from("ai_responses")
        .insert({
          review_id: review.id,
          ton_utilise: profile.ton_marque,
          reponse_generee: data.reponse,
        })
        .select()
        .single();

      if (savedResponse) {
        setAiResponse(savedResponse);
        try {
          await supabase
            .from("reviews")
            .update({ status: "reponse_prête" })
            .eq("id", review.id);
        } catch (e) {
          // Ignorer si le champ n'existe pas
        }
      }
    } catch (error) {
      console.error("Error in generateResponse:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Copier la réponse
  const handleCopy = async () => {
    if (!aiResponse || !currentReview) return;

    setCopying(true);
    const currentReviewId = currentReview.id; // Sauvegarder l'ID avant de réinitialiser
    
    try {
      const supabase = createClient();
      
      // 1. Copier la réponse dans le presse-papier
      await navigator.clipboard.writeText(aiResponse.reponse_generee);
      console.log("Response copied to clipboard");
      
      // 2. Ajouter l'avis à la liste des avis traités IMMÉDIATEMENT (pour éviter qu'il ne revienne)
      setProcessedReviewIds((prev) => {
        const newSet = new Set([...prev, currentReviewId]);
        processedReviewIdsRef.current = newSet; // Mettre à jour la ref aussi
        console.log(`Added review ${currentReviewId} to processed list. Total processed: ${newSet.size}`);
        return newSet;
      });
      
      // 3. Marquer l'avis comme "publié" pour qu'il ne revienne plus dans la liste
      // IMPORTANT : Attendre que la mise à jour soit complète avant de continuer
      try {
        const { error: updateError, data: updatedReview } = await supabase
          .from("reviews")
          .update({ status: "publié" })
          .eq("id", currentReviewId)
          .select("id, status")
          .single();
        
        if (updateError) {
          if (updateError.message.includes("column") || updateError.message.includes("status")) {
            console.warn("Status column might not exist, using fallback exclusion");
            // Si la colonne n'existe pas, on continue quand même car processedReviewIdsRef servira de fallback
          } else {
            console.error("Error updating status:", updateError);
            // Même en cas d'erreur, on continue car processedReviewIdsRef servira de fallback
          }
        } else {
          console.log("Review marked as published:", currentReviewId, "Status:", updatedReview?.status);
        }
      } catch (e) {
        // Le champ status n'existe peut-être pas encore - c'est normal
        console.warn("Status field might not exist:", e);
        // On continue quand même car processedReviewIdsRef servira de fallback
      }
      
      // 4. Afficher le message de succès
      setCopySuccess(true);

      // 5. Attendre 1 seconde puis passer automatiquement à l'avis suivant
      setTimeout(() => {
        console.log("Loading next review after copy...");
        setCopySuccess(false);
        setCopying(false);
        setAiResponse(null);
        setCurrentReview(null);
        setLoading(true);
        // Recharger les stats de réassurance
        loadReassuranceStats();
        // Charger le prochain avis (celui-ci ne sera plus dans la liste car il est dans processedReviewIdsRef)
        loadNextReview();
      }, 1000);
    } catch (error) {
      console.error("Error copying:", error);
      setCopying(false);
    }
  };

  useEffect(() => {
    loadUserPlan();
    loadReassuranceStats();
    loadNextReview();
    
    // Vérifier si on vient de créer un compte via l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const accountCreated = urlParams.get("account_created");
    if (accountCreated === "true") {
      setShowWelcomeMessage(true);
      // Retirer le paramètre de l'URL après 5 secondes
      setTimeout(() => {
        router.replace("/app/valider");
        setShowWelcomeMessage(false);
      }, 5000);
    }
    
    // Rafraîchir les stats toutes les 30 secondes
    const refreshInterval = setInterval(() => {
      loadReassuranceStats();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Chargement de l'avis suivant...</p>
        </div>
      </div>
    );
  }

  if (!currentReview) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-50 mb-2">À valider maintenant</h1>
          <p className="text-slate-400">Tous tes avis sont traités ! Aucun avis en attente.</p>
        </div>
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl shadow-premium p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-50 mb-3">Tout est à jour !</h3>
            <p className="text-slate-400 mb-6">
              Tous tes avis ont été traités. De nouveaux avis apparaîtront ici automatiquement.
            </p>
            <Button
              onClick={() => router.push("/app/historique")}
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            >
              Voir l'historique
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isNegative = currentReview.note !== null && currentReview.note <= 2;
  const isNeutral = currentReview.note === 3;
  const isPositive = currentReview.note !== null && currentReview.note >= 4;
  const estimatedTime = Math.ceil(remainingCount * 0.5); // ~30 secondes par avis

  // Limiter l'affichage de la réponse à quelques lignes
  const responseLines = aiResponse?.reponse_generee.split("\n") || [];
  const previewLines = 4;
  const shouldTruncate = responseLines.length > previewLines && !showFullResponse;
  const displayResponse = shouldTruncate
    ? responseLines.slice(0, previewLines).join("\n")
    : aiResponse?.reponse_generee || "";

  return (
    <div className="h-full flex flex-col">
      {/* Message de bienvenue après confirmation email */}
      {showWelcomeMessage && (
        <div className="mb-6 flex-shrink-0">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-xl shadow-premium p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎉</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-300 mb-1">Bienvenue sur AvisPro !</h3>
                <p className="text-xs text-emerald-200/80">
                  Ton compte a été créé avec succès. Tu es maintenant connecté et prêt à utiliser AvisPro.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Titre et indicateurs de valeur */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-50 mb-2">À valider maintenant</h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{remainingCount} avis en attente de validation</span>
          <span>•</span>
          <span>Temps estimé : moins de {estimatedTime} minute{estimatedTime > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Structure en deux colonnes */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 min-h-0">
        {/* Bloc principal - DOMINANT */}
        <div className="flex flex-col min-h-0">
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl shadow-premium flex-1 flex flex-col min-h-0">
            <div className="p-6 flex flex-col flex-1 min-h-0">
              {/* a) Bandeau de contexte */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {isNegative && (
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/50">
                      Négatif
                    </Badge>
                  )}
                  {isNeutral && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                      Neutre
                    </Badge>
                  )}
                  {isPositive && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                      Positif
                    </Badge>
                  )}
                  {currentReview.note && (
                    <span className="text-xl text-slate-300">
                      {"★".repeat(currentReview.note)}
                      {"☆".repeat(5 - currentReview.note)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Badge Import automatique désactivé (gratuit) - Affiché uniquement si plan gratuit */}
                  {!isPaidPlan(userPlan) && (
                    <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-xs">
                      Import automatique désactivé (gratuit)
                    </Badge>
                  )}
                  {currentReview.status === "reponse_prête" && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                      Réponse prête
                    </Badge>
                  )}
                  {remainingCount > 1 && (
                    <span className="text-xs text-slate-400">{remainingCount - 1} restant{remainingCount > 2 ? "s" : ""}</span>
                  )}
                </div>
              </div>

              {/* Message de succès */}
              {copySuccess && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex-shrink-0">
                  <p className="text-sm text-emerald-300 font-medium">
                    ✓ Réponse copiée dans le presse-papier
                  </p>
                </div>
              )}

              {/* b) Avis reçu */}
              <div className="mb-6 flex-shrink-0">
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Avis reçu</label>
                <div className="p-4 bg-slate-950/50 border border-slate-800/40 rounded-xl max-h-32 overflow-y-auto">
                  {/* Pseudo avec avatar */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800/40">
                    <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 text-sm flex-shrink-0">
                      👤
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {currentReview.author_name || "Utilisateur Google"}
                    </span>
                  </div>
                  {/* Texte de l'avis */}
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentReview.contenu_avis}
                  </p>
                </div>
              </div>

              {/* c) Réponse générée automatiquement */}
              <div className="mb-6 flex-1 flex flex-col min-h-0">
                {generating ? (
                  <>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block">
                      Réponse générée automatiquement par l'IA 🤖
                    </label>
                    <div className="p-4 bg-slate-950/50 border border-slate-800/40 rounded-xl flex-1 flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                        <p className="text-slate-400">Génération en cours...</p>
                      </div>
                    </div>
                  </>
                ) : aiResponse ? (
                    <>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-400 block flex items-center gap-2">
                        <span>Réponse générée automatiquement par l'IA</span>
                        <span className="text-base">🤖</span>
                      </label>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-xs">
                        ✅ Réponse IA générée automatiquement
                      </Badge>
                    </div>
                    <div className={`p-4 rounded-xl flex-1 flex flex-col min-h-0 transition-all duration-300 ${
                      copySuccess 
                        ? "bg-emerald-500/20 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/40" 
                        : "bg-indigo-500/10 border border-indigo-500/30"
                    }`}>
                      <div className="flex-1 overflow-y-auto">
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {displayResponse}
                        </p>
                      </div>
                      {shouldTruncate && (
                        <button
                          onClick={() => setShowFullResponse(true)}
                          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline text-left"
                        >
                          Voir la réponse complète
                        </button>
                      )}
                      {showFullResponse && (
                        <button
                          onClick={() => setShowFullResponse(false)}
                          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline text-left"
                        >
                          Réduire
                        </button>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {/* d) Zone d'action - TOUT EN BAS */}
              <div className="mt-auto pt-6 border-t border-slate-800/40 flex-shrink-0">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleCopy}
                    disabled={copying || !aiResponse || copySuccess}
                    className="w-full h-14 text-lg font-semibold bg-accent-gradient hover:bg-accent-gradient-hover shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    {copying ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Copie...
                      </span>
                    ) : copySuccess ? (
                      <span className="flex items-center gap-2">
                        <span>✓</span>
                        Réponse copiée !
                      </span>
                    ) : (
                      "Copier la réponse"
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    Un clic = la réponse est copiée dans le presse-papier
                  </p>
                  {!isPaidPlan(userPlan) && (
                    <>
                      <p className="text-xs text-amber-400 text-center mt-2 font-medium">
                        Version gratuite : 5 réponses par mois maximum
                      </p>
                      <p className="text-xs text-slate-400 text-center mt-2">
                        Publication automatique indisponible • En version Pro, cette étape disparaît complètement
                      </p>
                      <p className="text-xs text-amber-400 text-center mt-2 font-medium">
                        Temps perdu ce mois-ci : ~{Math.ceil(remainingCount * 0.5)} min • {remainingCount} actions manuelles
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Colonne de droite - SECONDAIRE */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          {/* Indicateurs de réassurance pour plans payants */}
          {isPaidPlan(userPlan) && (
            <Card className="bg-gradient-to-br from-emerald-500/10 to-slate-950/95 border border-emerald-500/30 rounded-xl shadow-premium p-4">
              <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
                <span>✓</span>
                <span>Protection active</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Avis traités automatiquement ce mois</span>
                  <span className="font-bold">{reassuranceStats.avisTraitesAuto}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Avis négatifs neutralisés</span>
                  <span className="font-bold">{reassuranceStats.avisNegatifsNeutralises}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Temps économisé ce mois</span>
                  <span className="font-bold">{reassuranceStats.tempsEconomise} min</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Taux de réponse global</span>
                  <span className="font-bold">{reassuranceStats.tauxReponseGlobal}%</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300">
                  <span>Aucun avis sans réponse</span>
                  <span className="font-bold">{reassuranceStats.aucunAvisSansReponse ? "✓" : "⚠️"}</span>
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
              <div className="space-y-2.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Avis traités automatiquement ce mois</span>
                  <span>🔒</span>
                </div>
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

          {/* Bloc 1 : Workflow ultra-simple */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Workflow ultra-simple</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">1.</span>
                <span>L'IA écrit la réponse automatiquement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">2.</span>
                <span>Tu vérifies d'un coup d'œil</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">3.</span>
                <span>Tu cliques sur "Copier la réponse"</span>
              </li>
            </ul>
          </Card>

          {/* Bloc 2 : Priorisation intelligente */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-4">
            <h3 className="text-sm font-bold text-slate-50 mb-3">Priorisation intelligente</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>Les avis négatifs en premier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Puis les plus anciens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">•</span>
                <span>Les avis déjà publiés ne reviennent pas ici</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
