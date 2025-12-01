import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export const metadata = {
  title: "Répondre aux avis Google pour Restaurants | RéponsIA Avis",
  description: "Générez des réponses professionnelles aux avis Google pour votre restaurant. Adapté au secteur de la restauration avec vocabulaire et ton appropriés.",
};

export default function RestaurantsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white shadow-sm transition-all duration-200 ease-out">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-blue-600 transition-all duration-200 ease-out hover:scale-105">
              RéponsIA Avis
            </Link>
            <GoogleBadge />
          </div>
          <Link href="/sign-up">
            <Button className="transition-all duration-200 ease-out hover:shadow-md active:scale-[0.98]">Essayer gratuitement</Button>
          </Link>
        </div>
      </header>

      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto bg-white text-neutral-900 rounded-2xl shadow-lg p-8 animate-fade-in-up">
            <GoogleGradientBar className="max-w-full mx-auto mb-6 animate-fade-in" />
            <h1 className="text-5xl font-bold mb-6 text-center">
              Répondre aux avis Google de votre RESTAURANT avec l'IA
            </h1>
            <p className="text-xl text-neutral-600 text-center mb-8 max-w-2xl mx-auto">
              Générez des réponses professionnelles adaptées au secteur de la restauration en quelques secondes.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">

        {/* Problèmes */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Les défis des restaurants face aux avis Google</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Retards de service", desc: "Les clients se plaignent des temps d'attente, surtout en période de rush." },
              { title: "Qualité des plats", desc: "Des avis négatifs sur la fraîcheur, la cuisson ou les portions." },
              { title: "Service client", desc: "Problèmes d'accueil, d'attention ou de réactivité du personnel." },
              { title: "Hygiène et propreté", desc: "Remarques sur la propreté des locaux, des sanitaires ou de la vaisselle." },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 bg-red-50 rounded-2xl border border-red-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-semibold text-red-900 mb-2">{item.title}</h3>
                <p className="text-red-700">{item.desc}</p>
              </div>
            ))}
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Qualité des plats</h3>
              <p className="text-red-700">Des avis négatifs sur la fraîcheur, la cuisson ou les portions.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Service client</h3>
              <p className="text-red-700">Problèmes d'accueil, d'attention ou de réactivité du personnel.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Hygiène et propreté</h3>
              <p className="text-red-700">Remarques sur la propreté des locaux, des sanitaires ou de la vaisselle.</p>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="max-w-4xl mx-auto mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">La solution RéponsIA Avis</h2>
          <p className="text-lg mb-6">
            Notre IA comprend les spécificités de la restauration et génère des réponses qui :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Utilisent le vocabulaire du secteur (service, cuisine, accueil, ambiance)</li>
            <li>S'adaptent au ton de votre établissement (bistrot, gastronomique, fast-food)</li>
            <li>Proposent des solutions concrètes (remboursement, invitation à revenir, excuses sincères)</li>
            <li>Valorisent vos points forts (qualité des produits, savoir-faire, convivialité)</li>
          </ul>
        </div>

        {/* Bénéfices */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Pourquoi choisir RéponsIA Avis pour votre restaurant ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-2">Gain de temps</h3>
              <p className="text-gray-600">Répondez à tous vos avis en quelques minutes au lieu d'heures.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-2">Réponses professionnelles</h3>
              <p className="text-gray-600">Toujours le bon ton, adapté à votre type d'établissement.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-2">Amélioration de l'image</h3>
              <p className="text-gray-600">Montrez que vous prenez les avis au sérieux et améliorez votre e-réputation.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-2">Gain de temps</h3>
              <p className="text-gray-600">Répondez à tous vos avis en quelques minutes au lieu d'heures.</p>
            </div>
          </div>
        </div>

        {/* Tutoriel */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Comment ça marche ?</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Collez l'avis depuis Google</h3>
                <p className="text-gray-600">Copiez le texte de l'avis depuis votre profil Google Business.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">L'IA génère la réponse</h3>
                <p className="text-gray-600">Notre IA analyse l'avis et génère une réponse adaptée à la restauration.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Copiez et publiez</h3>
                <p className="text-gray-600">Copiez la réponse et publiez-la directement sur Google Business.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Tarifs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2">Gratuit</h3>
              <p className="text-3xl font-bold mb-4">0€<span className="text-sm font-normal text-gray-600">/mois</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ 5 réponses / mois</li>
                <li>✓ Mode simple</li>
              </ul>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">Commencer</Button>
              </Link>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg shadow-md border-2 border-blue-600">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">POPULAIRE</div>
              <h3 className="font-bold text-lg mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">23,99€<span className="text-sm font-normal text-gray-600">/mois</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Réponses illimitées</li>
                <li>✓ Réponses illimitées</li>
                <li>✓ 1 établissement</li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full">Choisir Pro</Button>
              </Link>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2">Business</h3>
              <p className="text-3xl font-bold mb-4">48,99€<span className="text-sm font-normal text-gray-600">/mois</span></p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Tous les avantages Pro</li>
                <li>✓ Jusqu'à 3 établissements</li>
              </ul>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">Choisir Business</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/sign-up">
            <Button size="lg">Essayer gratuitement</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

