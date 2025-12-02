import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleBadge } from "@/components/ui/GoogleBadge";
import { GoogleGradientBar } from "@/components/ui/GoogleGradientBar";

export const metadata = {
  title: "Répondre aux avis Google pour Garages Auto | AvisPro",
  description: "Générez des réponses professionnelles aux avis Google pour votre garage automobile. Adapté au secteur automobile avec vocabulaire et ton appropriés.",
};

export default function GaragesPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              AvisPro
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
          Répondre aux avis Google de votre GARAGE AUTO avec l'IA
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Générez des réponses professionnelles adaptées au secteur automobile en quelques secondes.
        </p>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Les défis des garages face aux avis Google</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Transparence des devis</h3>
              <p className="text-red-700">Surprises sur les prix ou manque de clarté dans les devis.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Délais de réparation</h3>
              <p className="text-red-700">Retards dans les réparations ou manque de communication.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Confiance et expertise</h3>
              <p className="text-red-700">Doutes sur la qualité des réparations ou la compétence.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Service client</h3>
              <p className="text-red-700">Problèmes d'accueil, d'écoute ou de suivi.</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">La solution AvisPro</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Utilise le vocabulaire du secteur (réparation, diagnostic, devis, garantie)</li>
            <li>S'adapte au ton de votre garage (professionnel, rassurant, transparent)</li>
            <li>Propose des solutions (nouveau devis, correction, garantie)</li>
            <li>Valorise votre expertise et votre sérieux</li>
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

