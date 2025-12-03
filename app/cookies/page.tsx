import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de cookies - AvisPro",
  description: "Politique de cookies du site AvisPro",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Politique de cookies</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <p className="text-lg text-gray-600">
              Cette politique de cookies explique comment AvisPro utilise les cookies et technologies similaires 
              sur le site <strong>avisprofr.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
              lors de la visite d'un site web. Il permet au site de reconnaître votre navigateur et de mémoriser 
              certaines informations vous concernant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Cookies utilisés sur AvisPro</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">2.1. Cookies techniques (strictement nécessaires)</h3>
            <p>
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. 
              Ils sont généralement définis en réponse à des actions que vous effectuez et qui équivalent à une demande de services, 
              comme la définition de vos préférences de confidentialité, la connexion à votre compte ou le remplissage de formulaires.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies d'authentification :</strong> pour maintenir votre session connectée</li>
              <li><strong>Cookies de sécurité :</strong> pour la protection contre les attaques CSRF</li>
              <li><strong>Cookies de préférences :</strong> pour mémoriser vos choix (langue, thème, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900">2.2. Cookies analytiques (optionnels)</h3>
            <p>
              Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre site. 
              Les données collectées sont agrégées et anonymisées.
            </p>
            <p>
              Actuellement, AvisPro n'utilise pas de cookies analytiques tiers (Google Analytics, etc.). 
              Si nous devions en utiliser à l'avenir, nous mettrions à jour cette politique et vous en informerions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Durée de conservation</h2>
            <p>
              Les cookies techniques sont conservés pour la durée de votre session ou jusqu'à leur expiration définie. 
              La durée de conservation varie selon le type de cookie :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies persistants :</strong> conservés jusqu'à leur expiration (généralement 30 jours maximum)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Gestion des cookies</h2>
            <p>
              Vous pouvez contrôler et gérer les cookies de plusieurs façons :
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-900">4.1. Paramètres du navigateur</h3>
            <p>
              La plupart des navigateurs vous permettent de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Voir quels cookies sont stockés et les supprimer individuellement</li>
              <li>Bloquer les cookies de sites tiers</li>
              <li>Bloquer tous les cookies</li>
              <li>Supprimer tous les cookies à la fermeture du navigateur</li>
            </ul>
            <p className="mt-4">
              <strong>Attention :</strong> Le blocage de tous les cookies peut affecter le fonctionnement du site AvisPro, 
              notamment l'authentification et la sauvegarde de vos préférences.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900">4.2. Instructions par navigateur</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies et autres données de sites</li>
              <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies et données de sites</li>
              <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies et données de sites web</li>
              <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site → Cookies et données de sites</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Cookies tiers</h2>
            <p>
              AvisPro peut utiliser des services tiers qui déposent leurs propres cookies :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe :</strong> pour le traitement des paiements (cookies techniques nécessaires)</li>
              <li><strong>Supabase :</strong> pour l'authentification et la base de données (cookies techniques nécessaires)</li>
            </ul>
            <p>
              Ces cookies sont nécessaires au fonctionnement du service et ne peuvent pas être désactivés 
              sans affecter les fonctionnalités de paiement et d'authentification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Consentement</h2>
            <p>
              Conformément à la réglementation en vigueur, votre consentement est requis pour les cookies non strictement nécessaires. 
              Actuellement, AvisPro n'utilise que des cookies techniques strictement nécessaires au fonctionnement du service.
            </p>
            <p>
              Si nous devions utiliser des cookies non essentiels à l'avenir, nous vous demanderions votre consentement 
              via une bannière de cookies et mettrions à jour cette politique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Modifications</h2>
            <p>
              Cette politique de cookies peut être modifiée à tout moment. 
              La version en vigueur est celle publiée sur cette page.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Contact</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter à :
            </p>
            <p>
              <strong>Email :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

