"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  metier: string;
  action: string;
  time: string;
}

const sampleActivities: Activity[] = [
  { id: "1", metier: "restaurant", action: "a généré une réponse pour un avis 5⭐", time: "Il y a 2 min" },
  { id: "2", metier: "coiffeur", action: "a répondu à un avis négatif", time: "Il y a 5 min" },
  { id: "3", metier: "garage", action: "a généré une réponse professionnelle", time: "Il y a 8 min" },
  { id: "4", metier: "photographe", action: "a traité 3 avis ce mois", time: "Il y a 12 min" },
  { id: "5", metier: "coach", action: "a amélioré sa note Google", time: "Il y a 15 min" },
];

const metierIcons: Record<string, string> = {
  restaurant: "🍽️",
  coiffeur: "✂️",
  garage: "🔧",
  photographe: "📸",
  coach: "💪",
};

export function ActivityFeed() {
  return (
    <Card className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <span className="animate-pulse-slow">⚡</span>
        Activité récente
      </h3>
      <div className="space-y-2">
        {sampleActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 text-xs text-slate-300 animate-fade-in"
            style={{ animationDelay: `${parseInt(activity.id) * 100}ms` }}
          >
            <span className="text-base">{metierIcons[activity.metier] || "👤"}</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium">Un {activity.metier}</span> {activity.action}
              <span className="text-slate-500 ml-1">· {activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3 italic">
        Activité anonyme de la communauté
      </p>
    </Card>
  );
}

