"use client";

import { Card } from "@/components/ui/card";
import { memo } from "react";

function RightPanelGenerateComponent() {
  return (
    <div className="space-y-6">

      {/* Carte 1 : Astuces */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Astuces pour répondre aux avis</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Commence toujours par remercier le client.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Reconnais le problème sans te justifier trop longtemps.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Propose une solution ou un contact concret à la fin.</span>
          </li>
        </ul>
      </Card>

      {/* Carte 2 : Activité récente */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Activité récente</h3>
        <div className="space-y-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-400">8 avis traités cette semaine</span>
          </div>
          <div>
            <span className="text-slate-400">Temps moyen de génération : </span>
            <span className="font-semibold text-slate-200">6 secondes</span>
          </div>
        </div>
      </Card>

      {/* Carte 3 : Crédits gratuits */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Crédits gratuits</h3>
        <div className="space-y-2 text-xs text-slate-300">
          <p>Sur le plan Free, tu as un nombre limité de réponses par mois.</p>
          <p>Passe en Pro pour répondre à tous tes avis sans limite.</p>
        </div>
      </Card>
    </div>
  );
}

export const RightPanelGenerate = memo(RightPanelGenerateComponent);

