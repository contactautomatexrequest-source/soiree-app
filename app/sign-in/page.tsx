"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Erreur de connexion. Vérifiez vos identifiants.");
        setLoading(false);
      } else {
        router.push("/app/valider");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erreur lors de la connexion:", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const benefits = [
    "Accès instantané à tes réponses IA",
    "Historique complet de tes avis",
    "Protection active de ton image",
    "Zéro configuration technique",
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 flex items-start justify-center pt-20">
      <div className="w-full max-w-5xl bg-white text-neutral-900 rounded-2xl shadow-xl p-10 animate-fade-in-up">
        {/* Titre renforcé */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center leading-tight">
          Accède à ton tableau de bord AvisPro
        </h1>
        
        {/* Sous-texte avec projection claire */}
        <p className="text-lg text-neutral-700 mb-8 text-center max-w-2xl mx-auto">
          Retrouve tes avis, tes réponses générées et l'état de ta protection en un clic.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Layout en 2 colonnes : Formulaire + Bénéfices */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Colonne gauche : Formulaire */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-neutral-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-600">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-neutral-900"
                />
              </div>

              {/* Bouton renforcé avec glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-pulse-slow"
                style={{
                  boxShadow: loading 
                    ? "0 0 20px rgba(99, 102, 241, 0.2)" 
                    : "0 0 30px rgba(99, 102, 241, 0.4), 0 10px 40px -10px rgba(0, 0, 0, 0.3)",
                }}
              >
                {loading ? "Connexion..." : "Accéder à mon dashboard"}
              </button>
            </form>

            {/* Réassurance sous le bouton */}
            <p className="mt-4 text-center text-xs text-neutral-500">
              Sans engagement · Données sécurisées · Accès immédiat après connexion
            </p>

            {/* Micro-preuve sociale */}
            <p className="mt-6 text-center text-sm text-neutral-700 font-medium">
              <span className="text-lg">⭐</span> Utilisé quotidiennement par des établissements locaux
            </p>

            {/* Lien "Créer un compte" secondaire */}
            <p className="mt-6 text-center text-sm text-neutral-500">
              Pas encore de compte ?{" "}
              <Link 
                href="/sign-up" 
                className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Colonne droite : Bénéfices */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <h2 className="text-xl font-bold mb-6 text-neutral-900">
              Ce qui t'attend dans ton dashboard
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-neutral-700"
                >
                  <span className="text-2xl text-emerald-500 flex-shrink-0">✓</span>
                  <span className="font-medium text-neutral-900">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
