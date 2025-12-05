"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function GoogleBusinessSync() {
  const [profiles, setProfiles] = useState<GoogleBusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleProfiles();
  }, []);

  const loadGoogleProfiles = async () => {
    try {
      const response = await fetch("/api/google/list");
      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles || []);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setLoading(false);
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
        // Recharger les profils
        await loadGoogleProfiles();
        // Afficher un message de succès
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
        await loadGoogleProfiles();
      } else {
        setError(data.error || "Erreur lors de la déconnexion");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <p className="text-slate-300 text-center">Chargement...</p>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="bg-slate-900/50 border border-slate-700 p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-slate-50 mb-2">
            Connecte ton profil Google Business
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Synchronise automatiquement tes avis et tes données depuis Google Business Profile.
          </p>
          <Button
            onClick={handleConnectGoogle}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Connecter Google Business
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="bg-red-900/20 border border-red-700 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      )}

      {profiles.map((profile) => (
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
      ))}
    </div>
  );
}

