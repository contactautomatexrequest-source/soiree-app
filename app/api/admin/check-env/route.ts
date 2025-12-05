import { NextRequest, NextResponse } from "next/server";

/**
 * Route API pour vérifier que toutes les variables d'environnement sont configurées
 * GET /api/admin/check-env
 * 
 * Vérifie toutes les variables critiques pour la production
 */
export async function GET(req: NextRequest) {
  const results: any = {
    required: {},
    optional: {},
    missing: [],
    errors: [],
    ready: true,
  };

  // ============================================
  // VARIABLES OBLIGATOIRES
  // ============================================

  // Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  results.required.supabase = {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅ Configuré" : "❌ MANQUANT",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "✅ Configuré" : "❌ MANQUANT",
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? "✅ Configuré" : "❌ MANQUANT",
  };

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    results.missing.push("Variables Supabase manquantes");
    results.ready = false;
  }

  // Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripePricePro = process.env.STRIPE_PRICE_ID_PRO;
  const stripePriceBusiness = process.env.STRIPE_PRICE_ID_BUSINESS;
  const stripePriceAgence = process.env.STRIPE_PRICE_ID_AGENCE;

  results.required.stripe = {
    STRIPE_SECRET_KEY: stripeSecretKey ? "✅ Configuré" : "❌ MANQUANT",
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret ? "✅ Configuré" : "❌ MANQUANT",
    STRIPE_PRICE_ID_PRO: stripePricePro ? "✅ Configuré" : "❌ MANQUANT",
    STRIPE_PRICE_ID_BUSINESS: stripePriceBusiness ? "✅ Configuré" : "❌ MANQUANT",
    STRIPE_PRICE_ID_AGENCE: stripePriceAgence ? "✅ Configuré" : "❌ MANQUANT",
  };

  if (!stripeSecretKey || !stripeWebhookSecret || !stripePricePro || !stripePriceBusiness || !stripePriceAgence) {
    results.missing.push("Variables Stripe manquantes");
    results.ready = false;
  }

  // OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  results.required.openai = {
    OPENAI_API_KEY: openaiKey ? "✅ Configuré" : "❌ MANQUANT",
  };

  if (!openaiKey) {
    results.missing.push("Variable OpenAI manquante");
    results.ready = false;
  }

  // Email (Resend)
  const resendKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const emailDomain = process.env.EMAIL_DOMAIN;

  results.required.email = {
    RESEND_API_KEY: resendKey ? "✅ Configuré" : "❌ MANQUANT",
    EMAIL_FROM: emailFrom ? "✅ Configuré" : "❌ MANQUANT",
    EMAIL_DOMAIN: emailDomain ? "✅ Configuré" : "❌ MANQUANT",
  };

  if (!resendKey || !emailFrom || !emailDomain) {
    results.missing.push("Variables Email (Resend) manquantes");
    results.ready = false;
  }

  // Application
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  results.required.app = {
    NEXT_PUBLIC_APP_URL: appUrl ? "✅ Configuré" : "❌ MANQUANT",
  };

  if (!appUrl) {
    results.missing.push("Variable NEXT_PUBLIC_APP_URL manquante");
    results.ready = false;
  }

  // Vérifier que l'URL est en HTTPS
  if (appUrl && !appUrl.startsWith("https://")) {
    results.errors.push("⚠️ NEXT_PUBLIC_APP_URL doit être en HTTPS pour la production");
  }

  // ============================================
  // VARIABLES OPTIONNELLES
  // ============================================

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

  results.optional.google = {
    GOOGLE_CLIENT_ID: googleClientId ? "✅ Configuré" : "⚠️ Optionnel",
    GOOGLE_CLIENT_SECRET: googleClientSecret ? "✅ Configuré" : "⚠️ Optionnel",
    GOOGLE_REDIRECT_URI: googleRedirectUri ? "✅ Configuré" : "⚠️ Optionnel",
  };

  // ============================================
  // VÉRIFICATIONS DE FORMAT
  // ============================================

  // Vérifier le format des clés Supabase
  if (supabaseUrl && !supabaseUrl.includes("supabase.co")) {
    results.errors.push("⚠️ NEXT_PUBLIC_SUPABASE_URL semble invalide (doit contenir 'supabase.co')");
  }

  if (supabaseAnonKey && !supabaseAnonKey.startsWith("eyJ")) {
    results.errors.push("⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY semble invalide (doit commencer par 'eyJ')");
  }

  if (supabaseServiceKey && !supabaseServiceKey.startsWith("eyJ")) {
    results.errors.push("⚠️ SUPABASE_SERVICE_ROLE_KEY semble invalide (doit commencer par 'eyJ')");
  }

  // Vérifier le format des clés Stripe
  if (stripeSecretKey && !stripeSecretKey.startsWith("sk_")) {
    results.errors.push("⚠️ STRIPE_SECRET_KEY semble invalide (doit commencer par 'sk_')");
  }

  if (stripeWebhookSecret && !stripeWebhookSecret.startsWith("whsec_")) {
    results.errors.push("⚠️ STRIPE_WEBHOOK_SECRET semble invalide (doit commencer par 'whsec_')");
  }

  if (stripePricePro && !stripePricePro.startsWith("price_")) {
    results.errors.push("⚠️ STRIPE_PRICE_ID_PRO semble invalide (doit commencer par 'price_')");
  }

  // Vérifier le format de la clé OpenAI
  if (openaiKey && !openaiKey.startsWith("sk-")) {
    results.errors.push("⚠️ OPENAI_API_KEY semble invalide (doit commencer par 'sk-')");
  }

  // Vérifier le format de la clé Resend
  if (resendKey && !resendKey.startsWith("re_")) {
    results.errors.push("⚠️ RESEND_API_KEY semble invalide (doit commencer par 're_')");
  }

  // ============================================
  // RÉSUMÉ
  // ============================================

  const hasErrors = results.errors.length > 0;
  const hasMissing = results.missing.length > 0;

  results.summary = {
    ready: results.ready && !hasErrors && !hasMissing,
    missingCount: results.missing.length,
    errorsCount: results.errors.length,
    message: hasMissing
      ? `❌ ${results.missing.length} groupe(s) de variables manquantes`
      : hasErrors
      ? `⚠️ ${results.errors.length} avertissement(s) à vérifier`
      : "✅ Toutes les variables sont configurées correctement !",
  };

  return NextResponse.json(results, {
    status: results.ready && !hasErrors && !hasMissing ? 200 : 500,
  });
}

