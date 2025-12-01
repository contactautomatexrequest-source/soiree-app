import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export const metadata = {
  title: "Répondre aux avis Google pour Coiffeurs | RéponsIA Avis",
  description: "Générez des réponses professionnelles aux avis Google pour votre salon de coiffure. Adapté au secteur de la coiffure avec vocabulaire et ton appropriés.",
};

export default function CoiffeursPage() {
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
          Répondre aux avis Google de votre SALON DE COIFFURE avec l'IA
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Générez des réponses professionnelles adaptées au secteur de la coiffure en quelques secondes.
        </p>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Les défis des coiffeurs face aux avis Google</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Coupe ratée</h3>
              <p className="text-red-700">Les clients mécontents de leur coupe ou couleur.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Conseil inadapté</h3>
              <p className="text-red-700">Problèmes de conseil ou d'écoute des besoins du client.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Prix et transparence</h3>
              <p className="text-red-700">Surprises sur les tarifs ou manque de clarté.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Accueil et disponibilité</h3>
              <p className="text-red-700">Difficultés à prendre rendez-vous ou accueil décevant.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">La solution RéponsIA Avis</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Utilise le vocabulaire du secteur (coupe, couleur, brushing, conseil)</li>
            <li>S'adapte au ton de votre salon (traditionnel, moderne, premium)</li>
            <li>Propose des solutions (nouvelle coupe offerte, correction, remboursement)</li>
            <li>Valorise votre expertise et votre écoute</li>
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

