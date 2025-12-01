"use client";

import { Card } from "@/components/ui/card";
import { memo } from "react";

function RightPanelValiderComponent() {
  return (
    <div className="space-y-6">
      {/* Carte 1: Workflow simplifié */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-indigo-500/20 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-indigo-500/30">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
          <span className="text-indigo-400">⚡</span>
          Workflow ultra-simple
        </h3>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
          <li>L'IA génère la réponse automatiquement</li>
          <li>Tu cliques sur "Publier la réponse"</li>
          <li>La réponse est copiée et l'avis suivant s'affiche</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-slate-800/40">
          <p className="text-xs text-indigo-300 font-medium">
            Un seul clic par avis. C'est tout.
          </p>
        </div>
      </Card>

      {/* Carte 2: Priorisation */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-indigo-500/20">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
          <span className="text-indigo-400">🎯</span>
          Priorisation intelligente
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Les avis négatifs passent toujours en premier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Ensuite par ordre chronologique (plus anciens d'abord)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Les avis déjà publiés n'apparaissent plus ici</span>
          </li>
        </ul>
      </Card>

      {/* Carte 3: Automatisation */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-indigo-500/20">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 flex items-center gap-2">
          <span className="text-indigo-400">🤖</span>
          Automatisation complète
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Dès qu'un avis arrive (import automatique ou manuel), l'IA génère la réponse en arrière-plan. Tu n'as plus qu'à valider.
        </p>
      </Card>
    </div>
  );
}

export const RightPanelValider = memo(RightPanelValiderComponent);

