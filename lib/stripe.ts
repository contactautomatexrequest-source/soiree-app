import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

// Price IDs Stripe - À CONFIGURER dans votre dashboard Stripe
export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO || "price_xxx", // À remplacer
  business: process.env.STRIPE_PRICE_ID_BUSINESS || "price_xxx", // À remplacer
  agence: process.env.STRIPE_PRICE_ID_AGENCE || "price_xxx", // À remplacer
};

