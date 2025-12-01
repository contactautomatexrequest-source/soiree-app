"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface StatsCounterProps {
  totalResponses: number;
  timeSaved: number; // en minutes
}

export function StatsCounter({ totalResponses, timeSaved }: StatsCounterProps) {
  const [animatedResponses, setAnimatedResponses] = useState(0);
  const [animatedTime, setAnimatedTime] = useState(0);

  useEffect(() => {
    // Animation du compteur de réponses
    const duration = 1000;
    const steps = 30;
    const increment = totalResponses / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= totalResponses) {
        setAnimatedResponses(totalResponses);
        clearInterval(interval);
      } else {
        setAnimatedResponses(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalResponses]);

  useEffect(() => {
    // Animation du temps gagné
    const duration = 1000;
    const steps = 30;
    const increment = timeSaved / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= timeSaved) {
        setAnimatedTime(timeSaved);
        clearInterval(interval);
      } else {
        setAnimatedTime(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [timeSaved]);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="p-4 bg-slate-900 border border-slate-700 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center transition-transform duration-300 ease-out hover:scale-110">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 transition-all duration-300">
              {animatedResponses}
            </div>
            <div className="text-xs text-slate-300">Avis traités</div>
          </div>
        </div>
      </Card>
      <Card className="p-4 bg-slate-900 border border-slate-700 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center transition-transform duration-300 ease-out hover:scale-110">
            <span className="text-2xl">⏱️</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 transition-all duration-300">
              {animatedTime} min
            </div>
            <div className="text-xs text-slate-300">Temps gagné</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

