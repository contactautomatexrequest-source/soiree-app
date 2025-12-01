"use client";

import { Card } from "@/components/ui/card";
import { memo } from "react";

function RightPanelBusinessProfileComponent() {
  return (
    <div className="space-y-6">
      {/* Carte 1 : Aperçu de ton profil */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Aperçu de ton profil</h3>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div>
            <span className="text-slate-400">Nom :</span>{" "}
            <span className="font-medium">Ton établissement</span>
          </div>
          <div>
            <span className="text-slate-400">Ville :</span>{" "}
            <span className="font-medium">Ta ville</span>
          </div>
          <div>
            <span className="text-slate-400">Métier :</span>{" "}
            <span className="font-medium">Ton métier</span>
          </div>
          <div>
            <span className="text-slate-400">Ton :</span>{" "}
            <span className="font-medium">Ton de marque</span>
          </div>
        </div>
      </Card>

      {/* Carte 2 : Profil optimisé */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Profil optimisé pour ton métier</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Utilise le même nom que sur ta fiche Google.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Assure-toi que la ville est identique.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Choisis un ton cohérent avec ta clientèle (chaleureux, neutre, premium…).</span>
          </li>
        </ul>
      </Card>

      {/* Carte 3 : Complétude du profil */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Complétude du profil</h3>
        <div className="space-y-3">
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-4/5 transition-all duration-300"></div>
          </div>
          <p className="text-xs text-slate-300">
            Plus ton profil est complet, plus tes réponses sont crédibles.
          </p>
        </div>
      </Card>
    </div>
  );
}

export const RightPanelBusinessProfile = memo(RightPanelBusinessProfileComponent);

