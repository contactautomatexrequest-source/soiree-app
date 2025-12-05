"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildReviewEmailAddress } from "@/lib/email/alias";

interface BusinessProfile {
  id: string;
  nom_etablissement: string;
  ville: string;
  incoming_alias: string | null;
  metier: string;
  ton_marque: string;
}

interface GoogleBusinessProfile {
  id: string;
  google_place_id: string;
  nom_etablissement: string;
  categorie_principale: string | null;
  ville: string | null;
  note_moyenne: number | null;
  nombre_avis: number;
  photo_principale: string | null;
  url_fiche: string | null;
  derniere_sync_at: string | null;
  prochaine_sync_at: string | null;
  sync_en_cours: boolean;
  derniere_erreur: string | null;
  business_profile_id: string | null;
}

export default function ConnexionAvisPage() {
  const [loading, setLoading] = useState(true);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [googleProfiles, setGoogleProfiles] = useState<GoogleBusinessProfile[]>([]);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    loadData();
    
    // Écouter les mises à jour du profil d'établissement depuis le dashboard
    const handleProfileUpdate = () => {
      loadData();
    };
    
    window.addEventListener("business-profile-updated", handleProfileUpdate);
    
    return () => {
      window.removeEventListener("business-profile-updated", handleProfileUpdate);
    };
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // Charger le plan de l'utilisateur
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();
    
    setUserPlan(subscription?.plan || "free");

    // Charger les établissements
    const { data: profiles, error: profilesError } = await supabase
      .from("business_profiles")
      .select("id, nom_etablissement, ville, incoming_alias, metier, ton_marque")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error loading business profiles:", profilesError);
    } else if (profiles) {
      setBusinessProfiles(profiles);
    }

    // Charger les profils Google Business
    try {
      const response = await fetch("/api/google/list");
      const data = await response.json();
      if (data.success) {
        setGoogleProfiles(data.profiles || []);
      }
    } catch (err) {
      console.error("Error loading Google profiles:", err);
    }

    setLoading(false);
  };

  const handleCopyEmail = async (alias: string, businessId: string) => {
    if (!alias) return;
    
    const emailAddress = buildReviewEmailAddress(alias);
    
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopySuccessId(businessId);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (err) {
      console.error("Error copying email:", err);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = "/api/google/connect";
  };

  const handleSync = async (placeId: string, businessProfileId: string | null) => {
    setSyncing(placeId);
    setError(null);

    try {
      const response = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          businessProfileId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadData();
        alert(`Synchronisation réussie ! ${data.data.avis.synchronises} nouveaux avis importés.`);
      } else {
        setError(data.error || "Erreur lors de la synchronisation");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (placeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir déconnecter ce profil Google ?")) {
      return;
    }

    try {
      const response = await fetch("/api/google/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });

      const data = await response.json();

      if (data.success) {
        await loadData();
      } else {
        setError(data.error || "Erreur lors de la déconnexion");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
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

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* En-tête */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-50 mb-2">
          Connexion des avis Google
        </h1>
        <p className="text-sm text-slate-400">
          Connecte ton profil Google Business ou configure le transfert d'emails pour recevoir automatiquement tes avis.
        </p>
      </div>

      {error && (
        <Card className="bg-red-900/20 border border-red-700 p-4 mb-4">
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      )}

      {/* Section 1 : Synchronisation Google Business (automatique) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">
            🔗 Synchronisation automatique Google Business
          </h2>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/50">
            Recommandé
          </Badge>
        </div>

        {googleProfiles.length === 0 ? (
          <Card className="bg-slate-900/50 border border-slate-700 p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                Connecte ton profil Google Business
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Synchronise automatiquement tes avis et tes données depuis Google Business Profile. 
                Plus rapide et plus fiable que le transfert manuel.
              </p>
              <Button
                onClick={handleConnectGoogle}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Connecter Google Business
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {googleProfiles.map((profile) => {
              const linkedBusiness = businessProfiles.find(
                (b) => b.id === profile.business_profile_id
              );

              return (
                <Card key={profile.id} className="bg-slate-900/50 border border-slate-700 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-50">
                          {profile.nom_etablissement}
                        </h3>
                        {profile.sync_en_cours && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                            Synchronisation...
                          </Badge>
                        )}
                        {profile.derniere_erreur && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
                            Erreur
                          </Badge>
                        )}
                      </div>

                      {profile.ville && (
                        <p className="text-sm text-slate-400 mb-2">{profile.ville}</p>
                      )}

                      {profile.note_moyenne && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-400 text-lg">⭐</span>
                          <span className="text-slate-300 font-semibold">
                            {profile.note_moyenne.toFixed(1)}
                          </span>
                          <span className="text-slate-500 text-sm">
                            ({profile.nombre_avis} avis)
                          </span>
                        </div>
                      )}

                      {profile.derniere_sync_at && (
                        <p className="text-xs text-slate-500 mb-2">
                          Dernière sync : {new Date(profile.derniere_sync_at).toLocaleString("fr-FR")}
                        </p>
                      )}

                      {profile.derniere_erreur && (
                        <p className="text-xs text-red-400 mb-2">
                          Erreur : {profile.derniere_erreur}
                        </p>
                      )}

                      {!linkedBusiness && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                          <p className="text-xs text-amber-300 mb-2">
                            ⚠️ Ce profil Google n'est pas lié à un établissement
                          </p>
                          <p className="text-xs text-slate-400">
                            Les avis seront automatiquement créés dans un nouvel établissement lors de la synchronisation.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleSync(profile.google_place_id, profile.business_profile_id || null)}
                        disabled={profile.sync_en_cours || syncing === profile.google_place_id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                        size="sm"
                      >
                        {syncing === profile.google_place_id ? "Sync..." : "Resynchroniser"}
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(profile.google_place_id)}
                        variant="outline"
                        className="border-red-700 text-red-300 hover:bg-red-900/20 text-sm"
                        size="sm"
                      >
                        Déconnecter
                      </Button>
                    </div>
                  </div>

                  {profile.url_fiche && (
                    <a
                      href={profile.url_fiche}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Voir sur Google Business →
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2 : Transfert d'emails (manuel) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-50">
            📧 Transfert d'emails (méthode alternative)
          </h2>
          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/50">
            Manuel
          </Badge>
        </div>

        {businessProfiles.length === 0 ? (
          <Card className="bg-slate-900/50 border border-slate-700 p-6">
            <p className="text-slate-300 text-center mb-4">
              Aucun établissement configuré.
            </p>
            <Link href="/app/profil">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Créer un profil établissement
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {businessProfiles.map((business) => {
              const emailAddress = business.incoming_alias 
                ? buildReviewEmailAddress(business.incoming_alias)
                : null;
              const hasGoogleSync = googleProfiles.some(
                (gp) => gp.business_profile_id === business.id
              );

              return (
                <Card 
                  key={business.id}
                  className="bg-slate-900/50 border border-slate-700 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-50">
                          {business.nom_etablissement}
                        </h3>
                        {hasGoogleSync ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                            Google connecté
                          </Badge>
                        ) : business.incoming_alias ? (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                            Email configuré
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                            À configurer
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        {business.ville}
                      </p>

                      {business.incoming_alias ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-300 mb-2">
                              Adresse email de réception :
                            </p>
                            <div className="flex items-center gap-3">
                              <code className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-indigo-300 font-mono break-all">
                                {emailAddress || `${business.incoming_alias}@avisprofr.com`}
                              </code>
                              <Button
                                onClick={() => handleCopyEmail(business.incoming_alias!, business.id)}
                                className={`h-10 px-4 ${
                                  copySuccessId === business.id
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                              >
                                {copySuccessId === business.id ? "✓ Copié !" : "Copier"}
                              </Button>
                            </div>
                          </div>

                          {!hasGoogleSync && (
                            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                              <p className="text-sm font-semibold text-indigo-300 mb-2">
                                📧 Instructions de configuration :
                              </p>
                              <ol className="text-xs text-slate-300 space-y-2 ml-4 list-decimal">
                                <li>
                                  Dans Google Business, va dans les paramètres de notifications
                                </li>
                                <li>
                                  Configure un transfert d'email vers : <code className="text-indigo-300 font-mono">{emailAddress || `${business.incoming_alias}@avisprofr.com`}</code>
                                </li>
                                <li>
                                  Active les notifications pour tous les nouveaux avis
                                </li>
                                <li>
                                  Les avis arriveront automatiquement dans AvisPro
                                </li>
                              </ol>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          <p className="text-sm text-amber-300 mb-2">
                            ⚠️ Alias email en cours de génération
                          </p>
                          <p className="text-xs text-slate-400">
                            L'alias email est en cours de génération. Recharge la page dans quelques instants.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bloc d'information */}
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-3">
          Quelle méthode choisir ?
        </h3>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔗</div>
            <div>
              <p className="font-semibold text-indigo-300 mb-1">Synchronisation Google Business (Recommandé)</p>
              <p className="text-slate-400 text-xs">
                Synchronisation automatique complète : profil, avis, statistiques. Plus rapide, plus fiable, 
                aucune configuration manuelle nécessaire. Les données sont mises à jour automatiquement toutes les 6 heures.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">📧</div>
            <div>
              <p className="font-semibold text-blue-300 mb-1">Transfert d'emails (Alternative)</p>
              <p className="text-slate-400 text-xs">
                Méthode manuelle via transfert d'emails. Nécessite une configuration dans Google Business. 
                Utile si tu préfères garder le contrôle ou si la synchronisation Google n'est pas disponible.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sécurité */}
      <Card className="bg-slate-900/50 border border-slate-700 p-6 mt-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <p className="text-sm font-semibold text-slate-50 mb-1">
              Sécurité garantie
            </p>
            <p className="text-xs text-slate-400">
              Chaque établissement a son propre alias unique ou profil Google. Il est impossible qu'un avis d'un autre établissement 
              soit associé au tien. Toutes les données sont isolées par utilisateur.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
