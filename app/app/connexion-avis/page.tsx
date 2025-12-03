"use client";

import { useState, useEffect } from "react";
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
}

export default function ConnexionAvisPage() {
  const [loading, setLoading] = useState(true);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  useEffect(() => {
    const loadBusinessProfiles = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Charger tous les établissements de l'utilisateur connecté
      // RLS garantit qu'il ne voit que les siens
      const { data, error } = await supabase
        .from("business_profiles")
        .select("id, nom_etablissement, ville, incoming_alias")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading business profiles:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setBusinessProfiles(data);
      }
      setLoading(false);
    };

    loadBusinessProfiles();
  }, []);

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
          Configure le transfert d'emails pour recevoir automatiquement tes avis Google.
        </p>
      </div>

      {/* Liste des établissements */}
      {businessProfiles.length === 0 ? (
        <Card className="bg-slate-900/50 border border-slate-700 p-6">
          <p className="text-slate-300 text-center">
            Aucun établissement configuré. Crée un profil établissement pour commencer.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {businessProfiles.map((business) => {
            const emailAddress = business.incoming_alias 
              ? buildReviewEmailAddress(business.incoming_alias)
              : null;

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
                      {business.incoming_alias ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                          Configuré
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

      {/* Bloc d'information générale */}
      <Card className="bg-slate-900/50 border border-slate-700 p-6 mt-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-3">
          Comment ça fonctionne ?
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 text-lg">1.</span>
            <div>
              <p className="font-semibold">Chaque établissement a une adresse email unique</p>
              <p className="text-slate-400 text-xs mt-1">
                Cette adresse est spécifique à ton établissement et garantit que seuls tes avis sont traités.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 text-lg">2.</span>
            <div>
              <p className="font-semibold">Configure le transfert dans Google Business</p>
              <p className="text-slate-400 text-xs mt-1">
                Transfère les emails de notifications d'avis vers l'adresse fournie ci-dessus.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 text-lg">3.</span>
            <div>
              <p className="font-semibold">Les avis arrivent automatiquement</p>
              <p className="text-slate-400 text-xs mt-1">
                Dès qu'un avis est publié sur Google, il est reçu et traité automatiquement par l'IA.
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
              Chaque établissement a son propre alias unique. Il est impossible qu'un avis d'un autre établissement 
              soit associé au tien. Toutes les données sont isolées par utilisateur.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

