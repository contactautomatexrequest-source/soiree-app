import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité - AvisPro",
  description: "Politique de confidentialité et protection des données personnelles - AvisPro",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Politique de confidentialité</h1>
        
        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <p className="text-lg text-gray-600">
              La présente politique de confidentialité décrit la manière dont AvisPro collecte, utilise et protège 
              vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) 
              et à la loi Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est AvisPro.
            </p>
            <p>
              <strong>Contact :</strong> <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données d'identification :</strong> adresse email, mot de passe (hashé)</li>
              <li><strong>Données de profil :</strong> nom de l'établissement, adresse, informations professionnelles</li>
              <li><strong>Données d'avis :</strong> avis Google reçus, réponses générées</li>
              <li><strong>Données de paiement :</strong> informations de facturation via Stripe (gérées par Stripe)</li>
              <li><strong>Données techniques :</strong> adresse IP, logs de connexion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Finalité du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir le service AvisPro (gestion des avis Google, génération de réponses)</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Traiter les paiements et abonnements</li>
              <li>Améliorer nos services</li>
              <li>Vous contacter concernant votre compte ou le service</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Base légale du traitement</h2>
            <p>Le traitement de vos données personnelles est basé sur :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Exécution d'un contrat :</strong> fourniture du service AvisPro</li>
              <li><strong>Consentement :</strong> pour l'utilisation de cookies non essentiels</li>
              <li><strong>Obligation légale :</strong> conservation des données de facturation</li>
              <li><strong>Intérêt légitime :</strong> amélioration du service, sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Hébergement des données</h2>
            <p>
              Vos données sont hébergées par :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase :</strong> base de données et authentification (UE/US)</li>
              <li><strong>Stripe :</strong> données de paiement (conformes PCI-DSS)</li>
              <li><strong>Netlify :</strong> hébergement de l'application</li>
            </ul>
            <p>
              Tous nos prestataires sont soumis à des obligations strictes de confidentialité et de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Durée de conservation</h2>
            <p>
              Nous conservons vos données personnelles :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Données de compte :</strong> pendant la durée d'utilisation du service et 3 ans après la fermeture du compte</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
              <li><strong>Données d'avis :</strong> pendant la durée d'utilisation du service</li>
              <li><strong>Logs techniques :</strong> 12 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Droit d'accès :</strong> vous pouvez demander l'accès à vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> vous pouvez corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> vous pouvez demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité :</strong> vous pouvez récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous pouvez vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation :</strong> vous pouvez demander la limitation du traitement</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@avisprofr.com" className="text-blue-600 hover:underline">contact@avisprofr.com</a>
            </p>
            <p>
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
              si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles 
              contre la perte, l'utilisation abusive, l'accès non autorisé, la divulgation, l'altération ou la destruction.
            </p>
            <p>
              Ces mesures incluent notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement des données sensibles</li>
              <li>Authentification sécurisée</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance et détection des intrusions</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Transferts de données</h2>
            <p>
              Vos données peuvent être transférées vers des pays situés en dehors de l'Union Européenne. 
              Dans ce cas, nous nous assurons que des garanties appropriées sont en place, conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Modifications</h2>
            <p>
              Cette politique de confidentialité peut être modifiée à tout moment. 
              La version en vigueur est celle publiée sur cette page avec indication de la date de dernière mise à jour.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
              vous pouvez nous contacter à :
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

