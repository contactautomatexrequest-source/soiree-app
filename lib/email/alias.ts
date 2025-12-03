/**
 * Génère un alias email unique pour un établissement
 * Format: avis-{id} où id est un identifiant unique basé sur l'UUID
 * Exemple: avis-3f92b7a1
 */
export function generateEmailAlias(businessId: string): string {
  // Utiliser les 8 premiers caractères de l'UUID (sans tirets) pour un identifiant court et unique
  const shortId = businessId.replace(/-/g, '').substring(0, 8);
  return `avis-${shortId}`;
}

/**
 * Construit l'adresse email complète à partir de l'alias
 * Format: avis-{id}@avisprofr.com
 */
export function buildReviewEmailAddress(alias: string, domain?: string): string {
  const emailDomain = domain || process.env.EMAIL_DOMAIN || "avisprofr.com";
  // Si l'alias contient déjà @, on le retourne tel quel (déjà complet)
  if (alias.includes('@')) {
    return alias;
  }
  // Sinon, on construit l'adresse complète
  return `${alias}@${emailDomain}`;
}

/**
 * Extrait l'alias depuis une adresse email
 * Supporte deux formats :
 * - avis-{id}@avisprofr.com -> avis-{id}
 * - avis+{hash}@avisprofr.com -> avis+{hash} (ancien format pour compatibilité)
 */
export function extractAliasFromEmail(email: string): string | null {
  // Format nouveau : avis-{id}@avisprofr.com
  const newFormatMatch = email.match(/avis-([a-f0-9-]+)@/i);
  if (newFormatMatch) {
    return `avis-${newFormatMatch[1]}`;
  }
  
  // Format ancien : avis+{hash}@avisprofr.com (pour compatibilité)
  const oldFormatMatch = email.match(/avis\+([a-f0-9]+)@/i);
  if (oldFormatMatch) {
    return oldFormatMatch[1];
  }
  
  // Si l'email est juste l'alias sans @ (cas où on reçoit juste "avis-xxx")
  if (email.startsWith('avis-') && !email.includes('@')) {
    return email;
  }
  
  return null;
}

