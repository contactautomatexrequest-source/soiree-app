import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

/**
 * Retourne le client OpenAI (lazy initialization)
 * La vérification de OPENAI_API_KEY se fait au moment de l'utilisation
 * plutôt qu'à l'import pour éviter les erreurs lors du build
 */
function getOpenAI(): OpenAI {
  if (openaiInstance) {
    return openaiInstance;
  }

  // Vérifier les variables d'environnement uniquement au moment de l'utilisation
  // (pas à l'import pour éviter les erreurs lors du build)
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  openaiInstance = new OpenAI({
    apiKey: apiKey,
  });

  return openaiInstance;
}

// Export pour compatibilité avec le code existant
// Le proxy permet d'utiliser openai comme avant tout en faisant une initialisation lazy
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getOpenAI();
    const value = (client as any)[prop];
    // Si c'est une fonction, bind le contexte
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

