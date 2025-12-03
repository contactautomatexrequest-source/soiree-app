import { createHash } from "crypto";

/**
 * Génère un alias email unique pour un établissement
 * Format: hash court basé sur l'ID de l'établissement + timestamp
 */
export function generateEmailAlias(businessId: string): string {
  const hash = createHash("sha256")
    .update(businessId + Date.now().toString())
    .digest("hex")
    .substring(0, 12); // 12 caractères hexadécimaux
  
  return hash;
}

/**
 * Construit l'adresse email complète à partir de l'alias
 */
export function buildReviewEmailAddress(alias: string, domain?: string): string {
  const emailDomain = domain || process.env.EMAIL_DOMAIN || "avisprofr.com";
  return `avis+${alias}@${emailDomain}`;
}

/**
 * Extrait l'alias depuis une adresse email
 * Ex: "avis+abc123@domain.com" -> "abc123"
 */
export function extractAliasFromEmail(email: string): string | null {
  const match = email.match(/avis\+([a-f0-9]+)@/i);
  return match ? match[1] : null;
}

