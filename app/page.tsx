import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export default function HomePage() {
  const metiers = [
    { slug: "restaurants", name: "Restaurants", icon: "🍽️" },
    { slug: "coiffeurs", name: "Coiffeurs & Barbiers", icon: "✂️" },
    { slug: "garages", name: "Garages Auto", icon: "🔧" },
    { slug: "photographes", name: "Photographes", icon: "📸" },
    { slug: "coachs", name: "Coachs Sportifs", icon: "💪" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white shadow-sm transition-all duration-200 ease-out">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-600 transition-all duration-200 ease-out hover:scale-105">RéponsIA Avis</h1>
            <GoogleBadge />
          </div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="transition-all duration-200 ease-out hover:bg-gray-50 active:scale-[0.98]">Connexion</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="transition-all duration-200 ease-out hover:shadow-md active:scale-[0.98] animate-pulse-slow">Essayer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white text-neutral-900 rounded-2xl shadow-xl p-10 animate-fade-in-up">
            <GoogleGradientBar className="max-w-full mx-auto mb-8 animate-fade-in" />
            
            {/* Titre orienté perte client */}
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center leading-tight">
              Ne perds plus jamais un client à cause d'un avis non répondu
            </h2>
            
            {/* Sous-titre orienté automatisation immédiate */}
            <p className="text-xl text-neutral-700 mb-8 text-center max-w-2xl mx-auto">
              L'IA répond automatiquement à tous tes avis Google en moins de 30 secondes.
            </p>

            {/* 3 bénéfices visibles immédiatement - Orientés perte évitée */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="text-xl text-emerald-500">⚡</span>
                <span className="font-medium">Tu ne laisses plus jamais un client sans réponse</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="text-xl text-emerald-500">🤖</span>
                <span className="font-medium">Tu ne touches à rien</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="text-xl text-emerald-500">🛡️</span>
                <span className="font-medium">Ta réputation travaille pour toi 24/7</span>
              </div>
            </div>

            {/* Bouton principal - Action immédiate */}
            <div className="flex flex-col items-center mb-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link href="/sign-up" className="w-full max-w-md">
                <Button 
                  size="lg" 
                  className="w-full text-xl px-8 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-200 ease-out hover:scale-105 active:scale-[0.98]"
                >
                  Tester avec un vrai avis maintenant
                </Button>
              </Link>
              
              {/* Micro-réassurance sous le bouton */}
              <p className="text-center text-sm text-neutral-500 mt-3 mb-4">
                Sans carte bancaire • Résultat immédiat
              </p>

              {/* Lien secondaire - Visuellement secondaire */}
              <Link href="#comment-ca-marche" className="mt-2">
                <button className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors duration-200">
                  Voir comment ça marche
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche - 3 étapes ultra simples */}
      <section id="comment-ca-marche" className="bg-neutral-50 py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-neutral-900">
            Comment ça marche ?
          </h3>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { num: 1, title: "Colle l'avis", desc: "Copie le texte depuis Google et colle-le dans l'outil." },
              { num: 2, title: "L'IA répond", desc: "L'IA rédige une réponse professionnelle adaptée à ton métier." },
              { num: 3, title: "Tu publies", desc: "Tu copies la réponse et tu la publies sur Google." },
            ].map((step, index) => (
              <div key={step.num} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ease-out hover:scale-110">
                  <span className="text-xl md:text-2xl font-bold text-emerald-600">{step.num}</span>
                </div>
                <h4 className="font-semibold mb-2 text-neutral-900 text-lg">{step.title}</h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Micro-réassurance en bas de page */}
      <section className="bg-white py-8 border-t border-neutral-200">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
            Déjà utilisé par plus de 120 établissements pour automatiser leurs réponses et protéger leur image.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 RéponsIA Avis. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

