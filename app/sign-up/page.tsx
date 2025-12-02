"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/app/valider`,
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Erreur lors de la création du compte.");
        setLoading(false);
      } else {
        // Afficher le message de vérification d'email
        setEmailSent(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Erreur lors de la création du compte:", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const benefits = [
    "Réponses automatiques 24/7",
    "Zéro oubli d'avis",
    "Ton adapté à ton métier",
    "Annulable à tout moment",
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 flex items-start justify-center pt-20">
      <div className="w-full max-w-5xl bg-white text-neutral-900 rounded-2xl shadow-xl p-10 animate-fade-in-up">
        {/* Titre renforcé */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center leading-tight">
          Active tes réponses automatiques AvisPro en 30 secondes
        </h1>
        
        {/* Sous-texte prometteur */}
        <p className="text-lg text-neutral-700 mb-8 text-center max-w-2xl mx-auto">
          Dès l'inscription, l'IA commence à préparer tes réponses aux avis Google automatiquement.
        </p>

        {emailSent ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                Vérifie ton email pour continuer
              </h2>
              <p className="text-neutral-700 mb-6 max-w-md mx-auto">
                Nous avons envoyé un lien de confirmation à <strong className="text-neutral-900">{email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong className="font-semibold">📧 Vérifie ta boîte de réception</strong>
                  <br />
                  Clique sur le lien dans l'email pour activer ton compte et commencer à utiliser AvisPro.
                </p>
              </div>
              <div className="text-sm text-neutral-600 space-y-2">
                <p>Tu n'as pas reçu l'email ?</p>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setError("");
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                >
                  Réessayer avec un autre email
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                <label className="block text-sm font-medium mb-2 text-neutral-700">
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
                <label className="block text-sm font-medium mb-2 text-neutral-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-neutral-900"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Mot de passe simple, modifiable à tout moment
                </p>
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
                {loading ? "Création..." : "Créer mon compte et générer une réponse"}
              </button>
            </form>

            {/* Réassurance sous le bouton */}
            <p className="mt-4 text-center text-xs text-neutral-500">
              Compte supprimable à tout moment • Aucun engagement
            </p>

            {/* Preuve sociale */}
            <p className="mt-6 text-center text-sm text-neutral-700 font-medium">
              <span className="text-lg">⭐</span> Déjà utilisé par plus de{" "}
              <span className="font-bold text-neutral-900">120 établissements</span>
            </p>

            {/* Lien connexion */}
            <p className="mt-6 text-center text-sm text-neutral-600">
              Déjà un compte ?{" "}
              <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Colonne droite : Bénéfices */}
          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <h2 className="text-xl font-bold mb-6 text-neutral-900">
              Ce que tu obtiens immédiatement
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
          </>
        )}
      </div>
    </div>
  );
}
