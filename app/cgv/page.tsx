import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente - AvisPro",
  description: "Conditions Générales de Vente du service AvisPro",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Conditions Générales de Vente</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <p className="text-lg text-gray-600">
              Les présentes Conditions Générales de Vente (CGV) régissent la vente d'abonnements au service AvisPro 
              accessible sur le site <strong>avisprofr.com</strong>.
            </p>
            <p>
              En souscrivant à un abonnement, vous acceptez sans réserve les présentes CGV. 
              Il est recommandé de les lire attentivement avant toute souscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Objet</h2>
            <p>
              Les présentes CGV ont pour objet de définir les conditions de vente des abonnements au service AvisPro, 
              service SaaS de gestion automatique des avis Google.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Plans et prix</h2>
            <p>
              AvisPro propose plusieurs plans d'abonnement :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Plan Gratuit :</strong> fonctionnalités limitées, sans engagement</li>
              <li><strong>Plan Pro :</strong> fonctionnalités complètes pour un établissement</li>
              <li><strong>Plan Business :</strong> fonctionnalités avancées pour plusieurs établissements</li>
              <li><strong>Plan Agence :</strong> fonctionnalités professionnelles pour agences</li>
            </ul>
            <p>
              Les prix sont indiqués en euros TTC sur la page de facturation. 
              Les prix peuvent être modifiés à tout moment, mais les modifications ne s'appliquent pas aux abonnements en cours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Commande et paiement</h2>
            <p>
              La commande d'un abonnement s'effectue directement sur le site <strong>avisprofr.com</strong> 
              via la plateforme de paiement sécurisée Stripe.
            </p>
            <p>
              Le paiement est effectué par carte bancaire. Les transactions sont sécurisées et gérées par Stripe, 
              conforme aux normes PCI-DSS.
            </p>
            <p>
              L'abonnement prend effet immédiatement après confirmation du paiement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Durée et renouvellement</h2>
            <p>
              Les abonnements sont conclus pour une durée d'un mois, renouvelable automatiquement par tacite reconduction 
              pour la même durée, sauf résiliation de votre part ou de la nôtre.
            </p>
            <p>
              Le renouvellement s'effectue automatiquement à chaque échéance mensuelle. 
              Le montant de l'abonnement est prélevé automatiquement sur votre moyen de paiement enregistré.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Facturation</h2>
            <p>
              Une facture est générée automatiquement à chaque paiement et est disponible dans votre espace client. 
              Les factures sont également envoyées par email à l'adresse enregistrée sur votre compte.
            </p>
            <p>
              Pour toute question concernant la facturation, contactez : 
              <a href="mailto:billing@avisprofr.com" className="text-blue-600 hover:underline ml-1">billing@avisprofr.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Résiliation</h2>
            <p>
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace client, 
              section "Gérer l'abonnement". La résiliation prend effet à la fin de la période en cours.
            </p>
            <p>
              Aucun remboursement n'est effectué pour la période en cours. 
              Vous conservez l'accès au service jusqu'à la fin de la période payée.
            </p>
            <p>
              AvisPro se réserve le droit de résilier votre abonnement en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Non-paiement</li>
              <li>Violation des Conditions Générales d'Utilisation</li>
              <li>Utilisation frauduleuse du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Remboursement</h2>
            <p>
              Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation ne s'applique pas 
              aux contrats de fourniture de services numériques dont l'exécution a commencé avec l'accord du consommateur.
            </p>
            <p>
              Aucun remboursement n'est effectué pour les abonnements en cours, sauf en cas d'erreur de notre part 
              ou de défaillance majeure du service.
            </p>
            <p>
              En cas de résiliation de notre part pour un motif autre que votre faute, 
              un remboursement au prorata peut être accordé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Modification de l'abonnement</h2>
            <p>
              Vous pouvez modifier votre plan d'abonnement à tout moment depuis votre espace client. 
              En cas d'upgrade (passage à un plan supérieur), la différence est facturée au prorata. 
              En cas de downgrade (passage à un plan inférieur), le changement prend effet au prochain renouvellement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Disponibilité du service</h2>
            <p>
              AvisPro s'efforce d'assurer une disponibilité du service 24h/24 et 7j/7, 
              mais ne peut garantir une disponibilité absolue. Le service peut être interrompu pour maintenance.
            </p>
            <p>
              En cas d'indisponibilité prolongée (plus de 48h consécutives), 
              une prolongation d'abonnement peut être accordée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Responsabilité</h2>
            <p>
              La responsabilité d'AvisPro est limitée au montant de l'abonnement payé. 
              AvisPro ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du service.
            </p>
            <p>
              Vous êtes seul responsable de l'utilisation que vous faites des réponses générées par le service 
              et de leur publication sur Google.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Litiges</h2>
            <p>
              En cas de litige, nous vous invitons à nous contacter en priorité à : 
              <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline ml-1">contact@avisprofr.com</a>
            </p>
            <p>
              Conformément aux articles L. 611-1 et R. 612-1 et suivants du Code de la consommation, 
              vous avez la possibilité de recourir gratuitement à un médiateur de la consommation 
              en vue de la résolution amiable du litige qui nous oppose.
            </p>
            <p>
              Vous pouvez également utiliser la plateforme de règlement en ligne des litiges de l'Union Européenne : 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Droit applicable</h2>
            <p>
              Les présentes CGV sont régies par le droit français. 
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français 
              conformément aux règles de compétence en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGV ou votre abonnement :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Facturation :</strong> <a href="mailto:billing@avisprofr.com" className="text-blue-600 hover:underline">billing@avisprofr.com</a></li>
              <li><strong>Contact général :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a></li>
            </ul>
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

