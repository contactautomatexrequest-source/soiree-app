import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export const metadata = {
  title: "Répondre aux avis Google pour Coachs Sportifs | RéponsIA Avis",
  description: "Générez des réponses professionnelles aux avis Google pour votre activité de coaching. Adapté au secteur du sport et bien-être avec vocabulaire et ton appropriés.",
};

export default function CoachsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RéponsIA Avis
            </Link>
            <GoogleBadge />
          </div>
          <Link href="/sign-up">
            <Button>Essayer gratuitement</Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20">
        <GoogleGradientBar className="max-w-4xl mx-auto mb-8" />
        <h1 className="text-5xl font-bold mb-6 text-center">
          Répondre aux avis Google de votre COACHING avec l'IA
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Générez des réponses professionnelles adaptées au secteur du sport et bien-être en quelques secondes.
        </p>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Les défis des coachs face aux avis Google</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Résultats et méthode</h3>
              <p className="text-red-700">Mécontentement sur les résultats obtenus ou la méthode utilisée.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Accompagnement</h3>
              <p className="text-red-700">Manque de suivi, de motivation ou d'écoute.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Disponibilité</h3>
              <p className="text-red-700">Difficultés à joindre le coach ou manque de réactivité.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Prix et valeur</h3>
              <p className="text-red-700">Questionnement sur le rapport qualité-prix des séances.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">La solution RéponsIA Avis</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Utilise le vocabulaire du secteur (séance, programme, objectifs, motivation)</li>
            <li>S'adapte au ton de votre coaching (bienveillant, motivant, professionnel)</li>
            <li>Propose des solutions (nouveau programme, séance offerte, suivi renforcé)</li>
            <li>Valorise votre expertise et votre approche</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/sign-up">
            <Button size="lg">Essayer gratuitement</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

