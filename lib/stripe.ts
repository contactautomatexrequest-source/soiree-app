import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Retourne le client Stripe (lazy initialization)
 * La vérification de STRIPE_SECRET_KEY se fait au moment de l'utilisation
 * plutôt qu'à l'import pour éviter les erreurs lors du build
 */
function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  // Vérifier les variables d'environnement uniquement au moment de l'utilisation
  // (pas à l'import pour éviter les erreurs lors du build)
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2025-10-29.clover",
  });

  return stripeInstance;
}

// Export pour compatibilité avec le code existant
// Le proxy permet d'utiliser stripe comme avant tout en faisant une initialisation lazy
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as any)[prop];
    // Si c'est une fonction, bind le contexte
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Price IDs Stripe - À CONFIGURER dans votre dashboard Stripe
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO || "price_xxx", // À remplacer
  business: process.env.STRIPE_PRICE_ID_BUSINESS || "price_xxx", // À remplacer
  agence: process.env.STRIPE_PRICE_ID_AGENCE || "price_xxx", // À remplacer
};

