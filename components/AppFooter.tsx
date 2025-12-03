import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/mentions-legales" className="hover:text-slate-200 transition-colors">
              Mentions légales
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/confidentialite" className="hover:text-slate-200 transition-colors">
              Confidentialité
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/cgu" className="hover:text-slate-200 transition-colors">
              CGU
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/cgv" className="hover:text-slate-200 transition-colors">
              CGV
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/cookies" className="hover:text-slate-200 transition-colors">
              Cookies
            </Link>
          </div>
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} AvisPro. Tous droits réservés.</p>
            <p className="text-xs text-slate-500 mt-1">
              <a href="mailto:contact@avisprofr.com" className="hover:text-slate-300 transition-colors">
                contact@avisprofr.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

