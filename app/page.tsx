import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";
import { Footer } from "@/components/Footer";

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
            <h1 className="text-2xl font-bold text-blue-600 transition-all duration-200 ease-out hover:scale-105">AvisPro</h1>
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
            
            {/* Titre principal - Orienté valeur directe */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center leading-tight">
              Chaque avis reçoit une réponse professionnelle, automatiquement.
            </h1>
            
            {/* Sous-titre explicatif */}
            <p className="text-lg text-neutral-600 mb-6 text-center max-w-2xl mx-auto">
              AvisPro analyse, rédige et publie automatiquement des réponses adaptées à ton métier.
            </p>

            {/* Micro-badges de preuve discrets */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="text-emerald-500">✓</span>
                <span>Réponses automatiques</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="text-emerald-500">✓</span>
                <span>Temps réel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className="text-emerald-500">✓</span>
                <span>Image protégée</span>
              </div>
            </div>

            {/* Bouton principal - Action immédiate vers Pro */}
            <div className="flex flex-col items-center mb-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Link href="/sign-up" className="w-full max-w-md">
                <Button 
                  size="lg" 
                  className="w-full text-xl px-8 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-200 ease-out hover:scale-105 active:scale-[0.98]"
                >
                  Automatiser mes avis maintenant
                </Button>
              </Link>
              
              {/* Micro-réassurance sous le bouton */}
              <p className="text-center text-sm text-neutral-500 mt-3 mb-2">
                Activation en moins de 2 minutes • Sans engagement
              </p>

              {/* Indicateur discret Pro */}
              <p className="text-center text-xs text-neutral-400 mt-1 mb-4">
                Automatisations complètes disponibles dans les plans payants
              </p>

              {/* Lien secondaire - Visuellement secondaire */}
              <Link href="#gratuit-vs-pro" className="mt-2">
                <button className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors duration-200">
                  Voir la différence Gratuit / Pro
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bloc comparatif Gratuit / Pro */}
      <section id="gratuit-vs-pro" className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900">
            Gratuit ou Pro : quelle différence ?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Colonne Gratuit */}
            <div className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-8 opacity-75">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-neutral-700 mb-2">Plan Gratuit</h4>
                <p className="text-sm text-neutral-500">Mode découverte</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-neutral-800">5 réponses par mois maximum</p>
                    <p className="text-sm text-neutral-600">Limite rapidement atteinte</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">⏱️</span>
                  <div>
                    <p className="font-semibold text-neutral-800">Temps perdu chaque mois</p>
                    <p className="text-sm text-neutral-600">Tu dois copier-coller chaque avis manuellement</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <div>
                    <p className="font-semibold text-neutral-800">Aucun automatisme</p>
                    <p className="text-sm text-neutral-600">Risque pour ton image si tu oublies</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">📊</span>
                  <div>
                    <p className="font-semibold text-neutral-800">Simple outil de visualisation</p>
                    <p className="text-sm text-neutral-600">Pas de protection automatique</p>
                  </div>
                </li>
              </ul>

              <Link href="/sign-up">
                <Button variant="outline" className="w-full border-neutral-300 text-neutral-600 hover:bg-neutral-100">
                  Essayer gratuitement
                </Button>
              </Link>
            </div>

            {/* Colonne Pro - Mise en avant */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-8 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ Le plus choisi
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-emerald-900 mb-2">Plan Pro</h4>
                <p className="text-sm text-emerald-700 font-medium">Automatisation complète</p>
                <p className="text-lg font-bold text-emerald-900 mt-2">23,99€/mois</p>
                <p className="text-sm text-emerald-700">Moins d'1€ par jour</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Tu ne laisses plus jamais un avis sans réponse</p>
                    <p className="text-sm text-emerald-700">Protection automatique 24/7</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">🤖</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Les avis arrivent et sont traités automatiquement</p>
                    <p className="text-sm text-emerald-700">Tu n'as rien à faire</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">🛡️</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Ton établissement garde une image professionnelle</p>
                    <p className="text-sm text-emerald-700">En permanence, sans effort</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">💬</span>
                  <div>
                    <p className="font-semibold text-emerald-900">Assistance prioritaire</p>
                    <p className="text-sm text-emerald-700">Support réactif en cas de problème</p>
                  </div>
                </li>
              </ul>

              <Link href="/sign-up">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/50">
                  S'abonner au plan Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bloc "Le Pro fait tout à ta place" */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Le Pro fait tout à ta place
            </h3>
            <p className="text-xl text-slate-300">
              Automatisation complète, résultats garantis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: "⚡",
                title: "Réponses automatiques à tous les avis Google",
                desc: "Chaque avis reçoit une réponse professionnelle, sans exception. Même le week-end.",
              },
              {
                icon: "🎯",
                title: "Aucune réponse identique",
                desc: "L'IA adapte chaque réponse au contexte, à la note et à ton métier.",
              },
              {
                icon: "🎨",
                title: "Adaptation au ton et à la note",
                desc: "Réponses positives pour les 5 étoiles, apaisantes pour les critiques.",
              },
              {
                icon: "📊",
                title: "Historique complet",
                desc: "Tous tes avis et réponses centralisés, consultables à tout moment.",
              },
              {
                icon: "📈",
                title: "Suivi de réputation",
                desc: "Visualise l'évolution de ta note moyenne et de ta réputation.",
              },
              {
                icon: "😌",
                title: "Sérénité pour le professionnel",
                desc: "Tu peux te concentrer sur ton métier, l'IA gère ta réputation.",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-200"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h4 className="font-semibold text-lg mb-2 text-white">{benefit.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-emerald-500/50"
              >
                Protéger mon image automatiquement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bloc Avant / Après Pro */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900">
            Avant Pro vs Avec Pro
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Colonne "Sans Pro" */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <h4 className="text-2xl font-bold text-red-900 mb-6 text-center">Sans Pro</h4>
              
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-red-900 mb-2">Impact sur l'image</p>
                  <p className="text-sm text-red-700">
                    Les avis négatifs restent sans réponse, détériorant ta réputation visible par tous.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-red-900 mb-2">Impact sur la confiance</p>
                  <p className="text-sm text-red-700">
                    Les clients potentiels voient des avis non répondu et perdent confiance.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-red-900 mb-2">Impact sur le chiffre d'affaires</p>
                  <p className="text-sm text-red-700">
                    Chaque avis négatif non répondu peut te faire perdre des clients et des ventes.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne "Avec Pro" */}
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Avec Pro</h4>
              
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-emerald-900 mb-2">Impact sur l'image</p>
                  <p className="text-sm text-emerald-700">
                    Tous les avis reçoivent une réponse professionnelle, renforçant ton image de marque.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-emerald-900 mb-2">Impact sur la confiance</p>
                  <p className="text-sm text-emerald-700">
                    Les clients voient que tu prends soin de ta réputation et leur réponds systématiquement.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-emerald-900 mb-2">Impact sur le chiffre d'affaires</p>
                  <p className="text-sm text-emerald-700">
                    Une meilleure réputation se traduit par plus de clients et plus de ventes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-6 text-lg"
              >
                Passer au Pro maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bloc "Pour qui est le Pro" */}
      <section className="bg-neutral-50 py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-900">
            Pour qui est le Pro ?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: "🍽️",
                name: "Restaurants",
                benefit: "Réponds automatiquement aux avis clients, même pendant le service. Ton image reste irréprochable.",
              },
              {
                icon: "✂️",
                name: "Salons / Beauté",
                benefit: "Chaque avis client reçoit une réponse personnalisée. Ta réputation professionnelle est protégée.",
              },
              {
                icon: "💼",
                name: "Professions libérales",
                benefit: "Montre ta réactivité et ton professionnalisme. Les clients te font confiance.",
              },
              {
                icon: "🏢",
                name: "Agences",
                benefit: "Gère plusieurs établissements avec une automatisation centralisée. Gain de temps maximal.",
              },
            ].map((metier, index) => (
              <div
                key={index}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-400 transition-all duration-200"
              >
                <div className="text-4xl mb-4 text-center">{metier.icon}</div>
                <h4 className="font-bold text-lg mb-3 text-center text-neutral-900">{metier.name}</h4>
                <p className="text-sm text-neutral-600 leading-relaxed text-center">{metier.benefit}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-6 text-lg"
              >
                S'abonner au plan Pro
              </Button>
            </Link>
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

      {/* CTA Final orienté Pro */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-16 md:py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à automatiser tes avis ?
          </h3>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Rejoins les centaines d'établissements qui protègent leur réputation automatiquement avec le plan Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-8 py-6 text-lg shadow-lg"
              >
                S'abonner au plan Pro
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-6 text-lg"
              >
                Comparer les plans
              </Button>
            </Link>
          </div>
          <p className="text-sm text-emerald-100 mt-6">
            Sans engagement • Résiliable en 1 clic • Paiement sécurisé
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

