import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">AvisPro</h1>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Essayer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Répondez aux avis Google avec l'IA
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Générez des réponses professionnelles et adaptées à votre métier en quelques secondes.
          Plus besoin de perdre du temps à rédiger manuellement.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg">Commencer gratuitement</Button>
          </Link>
          <Link href="#comment-ca-marche">
            <Button variant="outline" size="lg">Comment ça marche ?</Button>
          </Link>
        </div>
      </section>

      {/* Métiers */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Pour quel métier ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metiers.map((metier) => (
            <Link
              key={metier.slug}
              href={`/${metier.slug}`}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
            >
              <div className="text-4xl mb-3">{metier.icon}</div>
              <h4 className="font-semibold">{metier.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Collez l'avis</h4>
              <p className="text-gray-600">
                Copiez le texte de l'avis depuis votre profil Google Business et collez-le dans l'application.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">L'IA génère la réponse</h4>
              <p className="text-gray-600">
                Notre IA analyse l'avis et génère une réponse professionnelle adaptée à votre métier et votre ton de marque.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Copiez et publiez</h4>
              <p className="text-gray-600">
                Copiez la réponse générée et publiez-la directement sur votre profil Google Business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold mb-4">
          Prêt à gagner du temps ?
        </h3>
        <p className="text-gray-600 mb-8">
          Rejoignez les centaines d'établissements qui utilisent AvisPro.
        </p>
        <Link href="/sign-up">
          <Button size="lg">Essayer gratuitement</Button>
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

