import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - AvisPro",
  description: "Conditions Générales d'Utilisation du service AvisPro",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <p className="text-lg text-gray-600">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service AvisPro 
              accessible sur le site <strong>avisprofr.com</strong>.
            </p>
            <p>
              En accédant et en utilisant ce service, vous acceptez sans réserve les présentes CGU. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Objet</h2>
            <p>
              AvisPro est un service SaaS permettant la gestion automatique des avis Google grâce à l'intelligence artificielle. 
              Le service permet notamment de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recevoir automatiquement les avis Google</li>
              <li>Générer des réponses professionnelles adaptées</li>
              <li>Gérer l'historique des avis et réponses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Accès au service</h2>
            <p>
              L'accès au service est réservé aux personnes majeures ou aux personnes mineures autorisées par leurs représentants légaux. 
              L'utilisation du service implique la création d'un compte utilisateur.
            </p>
            <p>
              AvisPro se réserve le droit de refuser l'accès au service à toute personne ne respectant pas les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Création de compte</h2>
            <p>
              Pour utiliser le service, vous devez créer un compte en fournissant :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Une adresse email valide</li>
              <li>Un mot de passe sécurisé</li>
              <li>Les informations nécessaires à la création de votre profil établissement</li>
            </ul>
            <p>
              Vous vous engagez à fournir des informations exactes, complètes et à jour. 
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Utilisation autorisée</h2>
            <p>
              Vous vous engagez à utiliser le service conformément à sa destination et aux présentes CGU. 
              Il est strictement interdit de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Tenter d'accéder de manière non autorisée au service ou à ses systèmes</li>
              <li>Perturber ou interrompre le fonctionnement du service</li>
              <li>Reproduire, copier ou revendre le service sans autorisation</li>
              <li>Utiliser des robots, scripts automatisés ou autres moyens pour accéder au service</li>
              <li>Transmettre des virus, malwares ou tout code nuisible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Plans et tarification</h2>
            <p>
              Le service est proposé selon différents plans (Gratuit, Pro, Business, Agence) avec des fonctionnalités et limites variables. 
              Les tarifs sont indiqués sur la page de facturation et peuvent être modifiés à tout moment. 
              Les modifications de tarif ne s'appliquent pas aux abonnements en cours.
            </p>
            <p>
              Les conditions spécifiques de chaque plan sont détaillées dans les Conditions Générales de Vente (CGV).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Disponibilité du service</h2>
            <p>
              AvisPro s'efforce d'assurer une disponibilité du service 24h/24 et 7j/7, mais ne peut garantir une disponibilité absolue. 
              Le service peut être interrompu pour maintenance, mise à jour ou en cas de force majeure.
            </p>
            <p>
              AvisPro ne saurait être tenu responsable des dommages résultant d'une indisponibilité temporaire du service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Propriété intellectuelle</h2>
            <p>
              Le service AvisPro, incluant son interface, son code source, ses algorithmes et ses contenus, 
              est la propriété exclusive d'AvisPro et est protégé par les lois sur la propriété intellectuelle.
            </p>
            <p>
              Vous disposez d'un droit d'utilisation personnel et non exclusif du service, 
              dans le cadre des fonctionnalités prévues et selon votre plan d'abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Données et confidentialité</h2>
            <p>
              Le traitement de vos données personnelles est régi par notre Politique de confidentialité, 
              conforme au RGPD. En utilisant le service, vous acceptez cette politique.
            </p>
            <p>
              Vous conservez la propriété de toutes les données que vous saisissez dans le service. 
              AvisPro s'engage à ne pas utiliser vos données à d'autres fins que la fourniture du service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Suspension et résiliation</h2>
            <p>
              AvisPro se réserve le droit de suspendre ou résilier votre compte en cas de :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse du service</li>
              <li>Non-paiement d'un abonnement</li>
              <li>Inactivité prolongée du compte</li>
            </ul>
            <p>
              Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte. 
              La résiliation prend effet immédiatement pour les comptes gratuits et à la fin de la période payée pour les abonnements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Responsabilité</h2>
            <p>
              AvisPro s'efforce de fournir un service de qualité, mais ne peut garantir :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>L'exactitude absolue des réponses générées par l'IA</li>
              <li>L'absence d'erreurs ou d'interruptions</li>
              <li>La compatibilité avec tous les systèmes</li>
            </ul>
            <p>
              La responsabilité d'AvisPro est limitée aux dommages directs et prévisibles. 
              AvisPro ne saurait être tenu responsable des dommages indirects, pertes de données ou manques à gagner.
            </p>
            <p>
              Vous êtes seul responsable de l'utilisation que vous faites des réponses générées par le service 
              et de leur publication sur Google.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Support</h2>
            <p>
              Pour toute question ou problème, vous pouvez contacter notre support :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email :</strong> <a href="mailto:support@avisprofr.com" className="text-blue-600 hover:underline">support@avisprofr.com</a></li>
              <li><strong>Contact général :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a></li>
            </ul>
            <p>
              Les utilisateurs des plans payants bénéficient d'un support prioritaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Modifications des CGU</h2>
            <p>
              AvisPro se réserve le droit de modifier les présentes CGU à tout moment. 
              Les modifications prennent effet dès leur publication sur le site.
            </p>
            <p>
              Il est de votre responsabilité de consulter régulièrement les CGU. 
              Votre utilisation continue du service après modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français. 
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français 
              conformément aux règles de compétence en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">14. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter à :
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

