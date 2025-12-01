"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

const METIERS = [
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "coiffeur", label: "Coiffeur / Barbier", icon: "✂️" },
  { value: "garage", label: "Garage Auto", icon: "🔧" },
  { value: "photographe", label: "Photographe", icon: "📸" },
  { value: "coach", label: "Coach Sportif / Bien-être", icon: "💪" },
] as const;

const TONS = [
  { value: "neutre", label: "Neutre", desc: "Professionnel et factuel" },
  { value: "chaleureux", label: "Chaleureux", desc: "Amical et accueillant" },
  { value: "premium", label: "Premium", desc: "Élégant et raffiné" },
  { value: "commercial", label: "Commercial", desc: "Dynamique et engageant" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [metier, setMetier] = useState<string>("");
  const [nomEtablissement, setNomEtablissement] = useState("");
  const [ville, setVille] = useState("");
  const [tonMarque, setTonMarque] = useState<string>("chaleureux");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!metier || !nomEtablissement || !ville) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { error } = await supabase.from("business_profiles").insert({
        user_id: user.id,
        metier,
        nom_etablissement: nomEtablissement,
        ville,
        ton_marque: tonMarque,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/app");
        router.refresh();
      }
    } catch (err: any) {
      setError("Erreur lors de la création du profil");
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Configuration de votre établissement"
        subtitle="Quelques informations pour personnaliser vos réponses aux avis."
      />
      <Card className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-700/60 rounded-2xl shadow-premium transition-all duration-200 hover:shadow-premium-lg hover:border-indigo-500/20">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
              {error}
            </div>
          )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-200">
                Quel est votre métier ? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {METIERS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMetier(m.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium active:scale-[0.98] ${
                      metier === m.value
                        ? "border-indigo-500/60 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-300 shadow-lg shadow-indigo-500/20"
                        : "border-slate-700/60 bg-slate-950/90 hover:border-indigo-500/30 text-slate-200 hover:bg-slate-900/90"
                    }`}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="text-sm font-medium">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!metier} className="w-full bg-accent-gradient hover:bg-accent-gradient-hover shadow-lg shadow-indigo-500/30">
              Continuer
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Nom de votre établissement <span className="text-red-400">*</span>
              </label>
              <Input
                value={nomEtablissement}
                onChange={(e) => setNomEtablissement(e.target.value)}
                placeholder="Ex: Le Bistrot du Coin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">
                Ville <span className="text-red-400">*</span>
              </label>
              <Input
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder="Ex: Paris"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-200">
                Ton de marque <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTonMarque(t.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium active:scale-[0.98] ${
                      tonMarque === t.value
                        ? "border-indigo-500/60 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-300 shadow-lg shadow-indigo-500/20"
                        : "border-slate-700/60 bg-slate-950/90 hover:border-indigo-500/30 text-slate-200 hover:bg-slate-900/90"
                    }`}
                  >
                    <div className="font-medium">{t.label}</div>
                    <div className="text-xs text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-accent-gradient hover:bg-accent-gradient-hover shadow-lg shadow-indigo-500/30">
                {loading ? "Création..." : "Terminer"}
              </Button>
            </div>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}

