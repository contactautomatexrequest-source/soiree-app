import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export const metadata = {
  title: "Répondre aux avis Google pour Photographes | RéponsIA Avis",
  description: "Générez des réponses professionnelles aux avis Google pour votre activité de photographie. Adapté au secteur avec vocabulaire et ton appropriés.",
};

export default function PhotographesPage() {
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
          Répondre aux avis Google de votre ACTIVITÉ PHOTO avec l'IA
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Générez des réponses professionnelles adaptées au secteur de la photographie en quelques secondes.
        </p>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Les défis des photographes face aux avis Google</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Qualité des photos</h3>
              <p className="text-red-700">Mécontentement sur le style, la retouche ou le rendu final.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Délais de livraison</h3>
              <p className="text-red-700">Retards dans la livraison des photos ou manque de communication.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Relation client</h3>
              <p className="text-red-700">Problèmes d'écoute, de conseil ou de disponibilité.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Prix et prestations</h3>
              <p className="text-red-700">Surprises sur les tarifs ou prestations non incluses.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">La solution RéponsIA Avis</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Utilise le vocabulaire du secteur (séance, retouche, livraison, style)</li>
            <li>S'adapte au ton de votre activité (artistique, professionnel, créatif)</li>
            <li>Propose des solutions (nouvelle séance, retouches supplémentaires, remboursement)</li>
            <li>Valorise votre créativité et votre professionnalisme</li>
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

