"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirection vers la page fusionnée de connexion des avis
 * Cette page redirige vers /app/connexion-avis qui combine
 * la synchronisation Google Business et le transfert d'emails
 */
export default function EmailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/connexion-avis");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-300">Redirection...</p>
      </div>
    </div>
  );
}
