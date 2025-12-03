import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Colonne 1 : AvisPro */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">AvisPro</h3>
            <p className="text-sm text-gray-600">
              La protection automatique de ta réputation. 
              Gère tes avis Google avec l'intelligence artificielle.
            </p>
          </div>

          {/* Colonne 2 : Service */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900 uppercase tracking-wide">Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-up" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <a href="mailto:support@avisprofr.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légale */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900 uppercase tracking-wide">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-gray-600 hover:text-gray-900 transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="text-gray-600 hover:text-gray-900 transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900 uppercase tracking-wide">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@avisprofr.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  contact@avisprofr.com
                </a>
              </li>
              <li>
                <a href="mailto:support@avisprofr.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  support@avisprofr.com
                </a>
              </li>
              <li>
                <a href="mailto:billing@avisprofr.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  billing@avisprofr.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} AvisPro. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

