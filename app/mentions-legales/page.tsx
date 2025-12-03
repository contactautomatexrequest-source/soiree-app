import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales - AvisPro",
  description: "Mentions légales du service AvisPro",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Mentions légales</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Informations légales</h2>
            <p>
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, 
              il est précisé aux utilisateurs du site <strong>avisprofr.com</strong> l'identité des différents intervenants 
              dans le cadre de sa réalisation et de son suivi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Éditeur du site</h2>
            <p>
              Le site <strong>avisprofr.com</strong> est édité par :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service :</strong> AvisPro</li>
              <li><strong>Email :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a></li>
              <li><strong>Directeur de la publication :</strong> Responsable de la publication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Hébergement</h2>
            <p>
              Le site <strong>avisprofr.com</strong> est hébergé par :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Hébergeur :</strong> Netlify, Inc.</li>
              <li><strong>Adresse :</strong> 44 Montgomery Street, Suite 750, San Francisco, CA 94104, États-Unis</li>
              <li><strong>Site web :</strong> <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.netlify.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p>
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite 
              sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Limitation de responsabilité</h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
              mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
            </p>
            <p>
              AvisPro ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, 
              lors de l'accès au site <strong>avisprofr.com</strong>, et résultant soit de l'utilisation d'un matériel ne répondant 
              pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Liens hypertextes</h2>
            <p>
              Le site <strong>avisprofr.com</strong> peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. 
              Les liens vers ces autres ressources vous font quitter le site <strong>avisprofr.com</strong>.
            </p>
            <p>
              Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de l'éditeur. 
              Aucune autorisation ni demande d'information préalable ne peut être exigée par l'éditeur à l'égard d'un site qui souhaite 
              établir un lien vers le site de l'éditeur. Il convient toutefois d'afficher ce site dans une nouvelle fenêtre du navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Contact</h2>
            <p>
              Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à l'adresse suivante :
            </p>
            <p>
              <strong>Email :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, 
              le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
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

