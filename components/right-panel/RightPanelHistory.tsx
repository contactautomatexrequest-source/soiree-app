"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef, memo } from "react";
import { createClient } from "@/lib/supabase/client";

function RightPanelHistoryComponent() {
  const [stats, setStats] = useState({
    total: 24,
    positive: 70,
    negative: 30,
    hasNegative: false,
  });
  const loadingRef = useRef(false);

  useEffect(() => {
    // Guard pour éviter les requêtes multiples
    if (loadingRef.current) return;
    loadingRef.current = true;

    const loadStats = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          loadingRef.current = false;
          return;
        }

        const { data } = await supabase
          .from("reviews")
          .select("note")
          .eq("user_id", user.id)
          .limit(50);

        if (data) {
          const total = data.length;
          const negative = data.filter((r) => r.note !== null && r.note <= 2).length;
          const positive = data.filter((r) => r.note !== null && r.note >= 4).length;
          
          setStats({
            total,
            positive: total > 0 ? Math.round((positive / total) * 100) : 70,
            negative: total > 0 ? Math.round((negative / total) * 100) : 30,
            hasNegative: negative > 0,
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        loadingRef.current = false;
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Carte 1 : Résumé des avis */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Résumé des avis</h3>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-slate-50">{stats.total}</div>
            <div className="text-xs text-slate-400">Avis traités affichés</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Positifs</span>
              <span className="text-lg font-semibold text-emerald-400">{stats.positive}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Négatifs</span>
              <span className="text-lg font-semibold text-rose-400">{stats.negative}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 flex overflow-hidden">
            <div
              className="bg-emerald-500 h-2 transition-all duration-300"
              style={{ width: `${stats.positive}%` }}
            ></div>
            <div
              className="bg-rose-500 h-2 transition-all duration-300"
              style={{ width: `${stats.negative}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Carte 2 : Typologie des avis */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Typologie des avis</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Positifs (4–5★)</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full w-3/4"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-300">Neutres (3★)</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-amber-400 h-1.5 rounded-full w-2/4"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-slate-300">Négatifs (1–2★)</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-rose-500 h-1.5 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Carte 3 : Conseil */}
      <Card className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-50 mb-3">Conseil</h3>
        <div className="space-y-2 text-xs text-slate-300">
          {stats.hasNegative ? (
            <>
              <p>Tu as des avis négatifs récents. Répondre vite et avec empathie est plus efficace qu'ignorer.</p>
              <p>Les futurs clients regardent autant les réponses que les avis eux-mêmes.</p>
            </>
          ) : (
            <>
              <p>Tu as surtout des avis positifs. Profite-en pour remercier et renforcer la relation client.</p>
              <p>Continue à répondre à chaque avis pour maintenir ta réputation.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export const RightPanelHistory = memo(RightPanelHistoryComponent);

