"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BestPractice {
  title: string;
  description: string;
  icon: string;
}

const practicesByMetier: Record<string, BestPractice[]> = {
  restaurant: [
    {
      title: "Répondez rapidement",
      description: "Les clients apprécient une réponse sous 24h, surtout pour les avis négatifs.",
      icon: "⏱️",
    },
    {
      title: "Proposez une solution",
      description: "Offrez un geste commercial ou une invitation à revenir pour transformer un avis négatif.",
      icon: "💡",
    },
    {
      title: "Remerciez les avis positifs",
      description: "Un simple remerciement renforce la relation client et encourage les autres à laisser un avis.",
      icon: "🙏",
    },
  ],
  coiffeur: [
    {
      title: "Personnalisez votre réponse",
      description: "Mentionnez des détails spécifiques de la visite pour montrer votre attention.",
      icon: "✂️",
    },
    {
      title: "Gérez les attentes",
      description: "Pour les avis sur les coupes, proposez un rendez-vous de correction si nécessaire.",
      icon: "🎯",
    },
    {
      title: "Valorisez votre expertise",
      description: "Mettez en avant votre formation et votre expérience dans vos réponses.",
      icon: "⭐",
    },
  ],
  garage: [
    {
      title: "Soyez transparent",
      description: "Expliquez clairement les réparations effectuées et les coûts associés.",
      icon: "🔍",
    },
    {
      title: "Rassurez sur la garantie",
      description: "Rappelez vos garanties et votre engagement qualité dans chaque réponse.",
      icon: "🛡️",
    },
    {
      title: "Proposez un suivi",
      description: "Invitez les clients à revenir pour un contrôle ou une révision.",
      icon: "🔧",
    },
  ],
  photographe: [
    {
      title: "Partagez votre vision",
      description: "Expliquez votre approche artistique pour aider les clients à comprendre votre style.",
      icon: "📸",
    },
    {
      title: "Demandez des retours constructifs",
      description: "Encouragez les clients à partager leurs attentes avant la séance.",
      icon: "💬",
    },
    {
      title: "Valorisez les témoignages",
      description: "Utilisez les avis positifs pour montrer votre portfolio et votre expertise.",
      icon: "✨",
    },
  ],
  coach: [
    {
      title: "Célébrez les progrès",
      description: "Reconnaissez les efforts de vos clients dans vos réponses aux avis positifs.",
      icon: "💪",
    },
    {
      title: "Adaptez votre approche",
      description: "Montrez que vous personnalisez vos programmes selon les besoins de chacun.",
      icon: "🎯",
    },
    {
      title: "Encouragez la régularité",
      description: "Rappelez l'importance de la constance dans les résultats obtenus.",
      icon: "📈",
    },
  ],
};

interface BestPracticesCardProps {
  metier: string;
}

export function BestPracticesCard({ metier }: BestPracticesCardProps) {
  const practices = practicesByMetier[metier] || practicesByMetier.restaurant;

  return (
    <Card className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl transition-transform duration-300 ease-out hover:scale-110">💡</span>
        <h3 className="text-sm font-semibold text-slate-200">Bonnes pratiques</h3>
      </div>
      <div className="space-y-3">
        {practices.map((practice, index) => (
          <div
            key={index}
            className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 transition-all duration-200 ease-out hover:bg-slate-900 hover:shadow-sm animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{practice.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 mb-1">
                  {practice.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {practice.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

