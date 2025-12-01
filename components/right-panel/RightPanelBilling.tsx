"use client";

import { Card } from "@/components/ui/card";
import { memo } from "react";

function RightPanelBillingComponent() {
  return (
    <div className="space-y-6">
      {/* Carte unique : Pourquoi Pro */}
      <Card className="bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-purple-500/10 border border-indigo-500/40 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-premium">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
          <span className="text-indigo-400">⭐</span>
          Pourquoi le plan Pro ?
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            <span>Plan utilisé par la majorité de nos clients professionnels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            <span>Moins d'1 € par jour pour protéger ton image</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            <span>Un seul client récupéré rembourse l'abonnement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">✓</span>
            <span>Réponses illimitées + import automatique</span>
          </li>
        </ul>
      </Card>

      {/* Carte : Risque du gratuit */}
      <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/5 border border-rose-500/30 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-premium">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
          <span className="text-rose-400">⚠️</span>
          Risque du plan gratuit
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Avec seulement 5 réponses par mois, tu ne peux pas répondre à tous tes avis. Les avis négatifs non répondues détériorent directement ton image professionnelle.
        </p>
      </Card>
    </div>
  );
}

export const RightPanelBilling = memo(RightPanelBillingComponent);
