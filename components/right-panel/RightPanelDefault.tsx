"use client";

import { Card } from "@/components/ui/card";
import { memo } from "react";

function RightPanelDefaultComponent() {
  return (
    <div className="space-y-6">
      {/* Carte 1 : Bienvenue */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Bienvenue dans AvisPro</h3>
        <p className="text-xs text-slate-300">
          Tes avis Google gérés automatiquement. La protection automatique de ta réputation.
        </p>
      </Card>

      {/* Carte 2 : Étapes suivantes */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Étapes suivantes</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">1.</span>
            <span>Configure ton établissement dans "Profil établissement".</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">2.</span>
            <span>Colle ton premier avis.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">3.</span>
            <span>Réponds à au moins 3 avis cette semaine.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

export const RightPanelDefault = memo(RightPanelDefaultComponent);

