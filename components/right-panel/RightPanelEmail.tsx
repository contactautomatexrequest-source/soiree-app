"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export const RightPanelEmail = React.memo(() => {
  return (
    <div className="space-y-4">
      {/* Rappel sécurité */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-emerald-500/20 rounded-2xl p-4 shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-emerald-500/30">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-emerald-400 text-xl">🔒</span>
          <div>
            <h3 className="text-slate-50 font-semibold text-sm mb-1">Sécurité garantie</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Nous n'avons accès à aucun autre email. Seuls les emails de notification d'avis Google que tu transfères volontairement sont traités.
            </p>
          </div>
        </div>
      </Card>

      {/* Résumé du fonctionnement */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl p-4 shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-indigo-500/20">
        <h3 className="text-slate-50 font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="text-indigo-400">🤖</span>
          Automatisation complète
        </h3>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside mb-3">
          <li>Tu copies l'adresse unique fournie</li>
          <li>Tu configures un transfert dans ta messagerie</li>
          <li>Les avis Google arrivent automatiquement</li>
          <li className="font-medium text-indigo-300">L'IA génère la réponse automatiquement</li>
          <li className="font-medium text-indigo-300">La réponse apparaît dans ton historique</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-slate-800/40">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-indigo-300 font-medium">Tu n'interviens plus :</span> l'IA fait tout de A à Z, de la réception de l'avis à la génération de la réponse.
          </p>
        </div>
      </Card>

      {/* Rappel plan Pro si applicable */}
      <Card className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 shadow-sm shadow-indigo-500/10 transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/20 hover:border-indigo-500/40">
        <div className="flex items-start gap-3">
          <span className="text-indigo-400 text-lg">⭐</span>
          <div>
            <h3 className="text-indigo-300 font-semibold text-sm mb-1">Fonctionnalité Premium</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              L'import automatique des avis est disponible sur les plans Pro, Business et Agence.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
});

RightPanelEmail.displayName = "RightPanelEmail";

