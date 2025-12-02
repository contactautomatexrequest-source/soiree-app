"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardStats {
  totalAvisCeMois: number;
  avisTraitesAuto: number;
  avisEnAttente: number;
  economieTemps: number;
  protectionActive: boolean;
  noteMoyenne: number;
  tauxReponseGlobal: number;
  derniereReponseAuto: string | null;
  avisNegatifsNeutralises: number;
  publicationAutomatique: boolean;
  aucunAvisSansReponse: boolean;
  multiEtablissements?: number; // Pour Business uniquement
  niveauReputation?: string; // "En amélioration" / "Stable" / "Optimisée"
  effetConversion?: number; // Estimation en %
  niveauConfiance?: string; // "Bon" / "Très bon" / "Excellent"
  tauxCompletudeProfil?: number; // %
}

interface BusinessProfile {
  id: string;
  metier: string;
  nom_etablissement: string;
  ville: string;
  ton_marque: string;
}

const METIERS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "coiffeur", label: "Coiffeur" },
  { value: "garage", label: "Garage" },
  { value: "photographe", label: "Photographe" },
  { value: "coach", label: "Coach" },
] as const;

const TONS = [
  { value: "neutre", label: "Neutre" },
  { value: "chaleureux", label: "Chaleureux" },
  { value: "premium", label: "Premium" },
  { value: "commercial", label: "Commercial" },
] as const;

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

// Helper pour vérifier si un plan est payant (pro, business, agence)
function isPaidPlan(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "agence";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [stats, setStats] = useState<DashboardStats>({
    totalAvisCeMois: 0,
    avisTraitesAuto: 0,
    avisEnAttente: 0,
    economieTemps: 0,
    protectionActive: false,
    noteMoyenne: 0,
    tauxReponseGlobal: 0,
    derniereReponseAuto: null,
    avisNegatifsNeutralises: 0,
    publicationAutomatique: false,
    aucunAvisSansReponse: true,
    multiEtablissements: 0,
    niveauReputation: "Stable",
    effetConversion: 0,
    niveauConfiance: "Bon",
    tauxCompletudeProfil: 0,
  });

  // État pour le formulaire de profil
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [formData, setFormData] = useState({
    metier: "",
    nom_etablissement: "",
    ville: "",
    ton_marque: "chaleureux",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }

      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

      try {
        // Charger le plan de l'utilisateur
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", user.id)
          .single();
        
        const currentPlan = subscription?.plan || "free";
        if (!cancelled) {
          setUserPlan(currentPlan);
        }

        // Charger le profil business
        const { data: businessProfile } = await supabase
          .from("business_profiles")
          .select("id, metier, nom_etablissement, ville, ton_marque")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (businessProfile && !cancelled) {
          setProfile(businessProfile);
          setFormData({
            metier: businessProfile.metier || "",
            nom_etablissement: businessProfile.nom_etablissement || "",
            ville: businessProfile.ville || "",
            ton_marque: businessProfile.ton_marque || "chaleureux",
          });
        }

        // Charger les statistiques
        const { data: allReviews } = await supabase
          .from("reviews")
          .select("*, ai_responses(id, created_at)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (cancelled || !allReviews) {
          if (!cancelled) setLoading(false);
          return;
        }

        const avisCeMois = allReviews.filter(
          (r) => new Date(r.created_at) >= debutMois
        );

        const avisAvecReponse = allReviews.filter((r) => r.ai_responses && r.ai_responses.length > 0);
        const avisTraitesCeMois = avisCeMois.filter((r) => r.ai_responses && r.ai_responses.length > 0);
        const avisEnAttente = avisCeMois.filter((r) => !r.ai_responses || r.ai_responses.length === 0);

        // Avis négatifs neutralisés (avis négatifs avec réponse)
        const avisNegatifs = allReviews.filter((r) => r.note !== null && r.note <= 2);
        const avisNegatifsNeutralises = avisNegatifs.filter((r) => r.ai_responses && r.ai_responses.length > 0).length;

        // Vérifier si publication automatique est active (gmail_credentials existe)
        const { data: gmailCreds } = await supabase
          .from("gmail_credentials")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        const publicationAutomatique = !!gmailCreds && isPaidPlan(currentPlan);

        // Vérifier s'il y a des avis sans réponse
        const aucunAvisSansReponse = allReviews.length === 0 || avisAvecReponse.length === allReviews.length;

        const dernierAvisTraite = avisAvecReponse.length > 0
          ? formatTimeAgo(new Date(avisAvecReponse[0].ai_responses[0].created_at))
          : null;

        const avisAvecNote = allReviews.filter((r) => r.note !== null);
        const noteMoyenne = avisAvecNote.length > 0
          ? avisAvecNote.reduce((sum, r) => sum + (r.note || 0), 0) / avisAvecNote.length
          : 0;

        const tauxReponseGlobal = allReviews.length > 0
          ? Math.round((avisAvecReponse.length / allReviews.length) * 100)
          : 0;

        const protectionActive = avisTraitesCeMois.length > 0 && isPaidPlan(currentPlan);
        const economieTemps = avisTraitesCeMois.length * 5;

        // Multi-établissements pour Business
        let multiEtablissements = 0;
        if (currentPlan === "business" || currentPlan === "agence") {
          const { data: businessProfiles } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("user_id", user.id);
          multiEtablissements = businessProfiles?.length || 0;
        }

        // Calculer le niveau de réputation (toujours positif)
        let niveauReputation = "Stable";
        if (noteMoyenne >= 4.5) {
          niveauReputation = "Optimisée";
        } else if (noteMoyenne >= 4.0) {
          niveauReputation = "En amélioration";
        } else if (noteMoyenne >= 3.5) {
          niveauReputation = "Stable";
        } else {
          niveauReputation = "En amélioration"; // Toujours positif
        }

        // Effet estimé sur conversion (basé sur taux de réponse et note moyenne)
        const effetConversion = Math.min(100, Math.round(
          (tauxReponseGlobal * 0.6) + (noteMoyenne * 10)
        ));

        // Niveau de confiance perçue
        let niveauConfiance = "Bon";
        if (tauxReponseGlobal >= 90 && noteMoyenne >= 4.5) {
          niveauConfiance = "Excellent";
        } else if (tauxReponseGlobal >= 75 && noteMoyenne >= 4.0) {
          niveauConfiance = "Très bon";
        } else {
          niveauConfiance = "Bon";
        }

        // Taux de complétude du profil
        const profilComplet = businessProfile && 
          businessProfile.metier && 
          businessProfile.nom_etablissement && 
          businessProfile.ville && 
          businessProfile.ton_marque;
        const tauxCompletudeProfil = profilComplet ? 100 : 
          (businessProfile ? 
            ((businessProfile.metier ? 25 : 0) + 
             (businessProfile.nom_etablissement ? 25 : 0) + 
             (businessProfile.ville ? 25 : 0) + 
             (businessProfile.ton_marque ? 25 : 0)) : 0);

        if (!cancelled) {
          setStats({
            totalAvisCeMois: avisCeMois.length,
            avisTraitesAuto: avisTraitesCeMois.length,
            avisEnAttente: avisEnAttente.length,
            economieTemps,
            protectionActive,
            noteMoyenne,
            tauxReponseGlobal,
            derniereReponseAuto: dernierAvisTraite,
            avisNegatifsNeutralises,
            publicationAutomatique,
            aucunAvisSansReponse,
            multiEtablissements,
            niveauReputation,
            effetConversion,
            niveauConfiance,
            tauxCompletudeProfil,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    // Rafraîchir les données toutes les 30 secondes pour mettre à jour les indicateurs
    const refreshInterval = setInterval(() => {
      if (!cancelled) {
        loadDashboard();
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, []);

  const handleSaveProfile = async () => {
    if (!formData.metier || !formData.nom_etablissement || !formData.ville) {
      setFormError("Veuillez remplir tous les champs");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setFormError("Vous devez être connecté");
        setSaving(false);
        return;
      }

      if (profile) {
        // Mettre à jour le profil existant
        const { error } = await supabase
          .from("business_profiles")
          .update({
            metier: formData.metier,
            nom_etablissement: formData.nom_etablissement,
            ville: formData.ville,
            ton_marque: formData.ton_marque,
          })
          .eq("id", profile.id);

        if (error) {
          setFormError(error.message);
          setSaving(false);
        } else {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          setSaving(false);
        }
      } else {
        // Créer un nouveau profil
        const { data, error } = await supabase
          .from("business_profiles")
          .insert({
            user_id: user.id,
            metier: formData.metier,
            nom_etablissement: formData.nom_etablissement,
            ville: formData.ville,
            ton_marque: formData.ton_marque,
          })
          .select()
          .single();

        if (error) {
          setFormError(error.message);
          setSaving(false);
        } else if (data) {
          setProfile(data);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          setSaving(false);
        }
      }
    } catch (err: any) {
      setFormError("Erreur lors de la sauvegarde");
      setSaving(false);
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

  // Helper pour obtenir le label du plan
  const getPlanLabel = (plan: string): string => {
    const labels: Record<string, string> = {
      free: "Free",
      pro: "Pro",
      business: "Business",
      agence: "Agence",
    };
    return labels[plan] || plan;
  };

  // Ligne 1 : Résumé d'impact immédiat (4 cartes)
  const impactCards = [
    {
      id: "avis-traites-auto",
      title: "Avis traités automatiquement ce mois",
      value: isPaidPlan(userPlan) ? `${stats.avisTraitesAuto}` : "0",
      icon: "⚡",
      microText: isPaidPlan(userPlan) ? "Tu n'as rien eu à faire" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.avisTraitesAuto > 0 ? "positive" : null,
    },
    {
      id: "avis-negatifs-neutralises",
      title: "Avis négatifs neutralisés",
      value: isPaidPlan(userPlan) ? `${stats.avisNegatifsNeutralises}` : "0",
      icon: "🛡️",
      microText: isPaidPlan(userPlan) ? "Client rassuré" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.avisNegatifsNeutralises > 0 ? "positive" : null,
    },
    {
      id: "temps-economise",
      title: "Temps économisé",
      value: isPaidPlan(userPlan) ? `${stats.economieTemps} min` : "0 min",
      icon: "⏱️",
      microText: isPaidPlan(userPlan) ? "Gain de productivité" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.economieTemps > 0 ? "positive" : null,
    },
    {
      id: "protection-reputation",
      title: "Protection de la réputation",
      value: isPaidPlan(userPlan) ? "Active" : "Inactive",
      icon: "✅",
      microText: isPaidPlan(userPlan) ? "Image protégée en continu" : "Active en Pro",
      status: isPaidPlan(userPlan) && stats.protectionActive ? "positive" : null,
    },
  ];

  // Ligne 2 : Sécurité et automatisation (4 cartes)
  const securiteCards = [
    {
      id: "publication-automatique",
      title: "Publication automatique",
      value: isPaidPlan(userPlan) ? "✅ Toujours ACTIVE" : "🔒",
      icon: "🚀",
      microText: isPaidPlan(userPlan) ? "Tes réponses sont publiées sans intervention" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.publicationAutomatique ? "positive" : null,
    },
    {
      id: "taux-reponse-global",
      title: "Taux de réponse global",
      value: isPaidPlan(userPlan) ? `${stats.tauxReponseGlobal}%` : "0%",
      icon: "📊",
      microText: isPaidPlan(userPlan) ? "Aucun client ignoré" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.tauxReponseGlobal > 0 ? "positive" : null,
    },
    {
      id: "derniere-action-ia",
      title: "Dernière intervention IA",
      value: isPaidPlan(userPlan) ? (stats.derniereReponseAuto || "Surveillance récente") : "🔒",
      icon: "🔄",
      microText: isPaidPlan(userPlan) ? "Dernière action effectuée pour toi" : "Disponible en Pro",
      status: isPaidPlan(userPlan) && stats.derniereReponseAuto ? "positive" : null,
    },
    {
      id: "statut-protection",
      title: "Statut de protection",
      value: isPaidPlan(userPlan) ? "Active en continu" : "Inactive",
      icon: "🛡️",
      microText: isPaidPlan(userPlan) ? "Système opérationnel 24/7" : "Active en Pro",
      status: isPaidPlan(userPlan) && stats.protectionActive ? "positive" : null,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-950">
      {/* 1. Bandeau supérieur (plein écran) */}
      <div className={`flex-shrink-0 border-b px-6 py-6 ${
        isPaidPlan(userPlan)
          ? "bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 border-indigo-500/30"
          : "bg-gradient-to-r from-amber-500/10 via-slate-800/20 to-amber-500/10 border-amber-500/20"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              {isPaidPlan(userPlan) 
                ? "Tableau de bord AvisPro"
                : "Tableau de bord AvisPro"}
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              {isPaidPlan(userPlan)
                ? "AvisPro — La protection automatique de ta réputation. Chaque avis est surveillé, analysé et traité automatiquement."
                : "AvisPro — Passe en Pro pour activer la protection automatique de ton image"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`text-sm font-semibold px-4 py-2 ${
              isPaidPlan(userPlan)
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}>
              Plan {getPlanLabel(userPlan)}
            </Badge>
            {isPaidPlan(userPlan) && (
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-sm font-semibold px-4 py-2">
                Système opérationnel 24/7
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8">
        {/* 2. Ligne 1 – Résumé d'impact immédiat (4 cartes) */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {impactCards.map((card) => (
              <Card
                key={card.id}
                className={`bg-gradient-to-br from-slate-900/95 to-slate-950/95 border rounded-xl shadow-premium p-5 h-40 flex flex-col justify-between transition-all duration-200 hover:border-slate-600/60 ${
                  card.status === "positive"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-slate-700/60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl leading-none">{card.icon}</div>
                  {card.status === "positive" && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-1 font-medium">{card.title}</div>
                <div className={`text-2xl font-bold leading-none mb-2 ${
                  card.status === "positive" ? "text-emerald-300" : "text-slate-50"
                }`}>
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 italic">{card.microText}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* 3. Ligne 2 – Sécurité et automatisation (4 cartes) */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {securiteCards.map((card) => (
              <Card
                key={card.id}
                className={`bg-gradient-to-br from-slate-900/95 to-slate-950/95 border rounded-xl shadow-premium p-5 h-40 flex flex-col justify-between transition-all duration-200 hover:border-slate-600/60 ${
                  card.status === "positive"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-slate-700/60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl leading-none">{card.icon}</div>
                  {card.status === "positive" && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-1 font-medium">{card.title}</div>
                <div className={`text-lg font-bold leading-none mb-2 ${
                  card.status === "positive" ? "text-emerald-300" : "text-slate-50"
                }`}>
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 italic">{card.microText}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Formulaire de profil */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-xl shadow-premium p-6 max-w-4xl mx-auto w-full">
          <h2 className="text-xl font-bold text-slate-50 mb-6">Profil établissement</h2>
        
        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-300">✓ Profil mis à jour avec succès</p>
          </div>
        )}

        {formError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">{formError}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Métier */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Métier
            </label>
            <select
              value={formData.metier}
              onChange={(e) => setFormData({ ...formData, metier: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Sélectionner un métier</option>
              {METIERS.map((metier) => (
                <option key={metier.value} value={metier.value}>
                  {metier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nom établissement */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom de l'établissement
            </label>
            <Input
              type="text"
              value={formData.nom_etablissement}
              onChange={(e) => setFormData({ ...formData, nom_etablissement: e.target.value })}
              placeholder="Ex: Restaurant Le Gourmet"
              className="w-full"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ville
            </label>
            <Input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              placeholder="Ex: Paris"
              className="w-full"
            />
          </div>

          {/* Ton de marque */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ton de marque
            </label>
            <select
              value={formData.ton_marque}
              onChange={(e) => setFormData({ ...formData, ton_marque: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {TONS.map((ton) => (
                <option key={ton.value} value={ton.value}>
                  {ton.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full h-12 bg-accent-gradient hover:bg-accent-gradient-hover shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
            >
              {saving ? "Sauvegarde..." : "Enregistrer le profil"}
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
