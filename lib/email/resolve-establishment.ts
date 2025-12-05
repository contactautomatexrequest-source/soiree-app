/**
 * Résout un alias email vers un établissement
 * Fonction utilitaire centrale pour le mapping alias → établissement
 * 
 * SÉCURITÉ RENFORCÉE :
 * - Mapping UNIQUEMENT via incoming_alias
 * - Vérification de l'unicité
 * - Logs détaillés
 * - Protection contre les collisions
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface EstablishmentMapping {
  userId: string;
  establishmentId: string;
  businessProfile: {
    id: string;
    nom_etablissement: string;
    ville: string;
    user_id: string;
  };
}

/**
 * Résout un alias email vers un établissement
 * 
 * @param email - L'adresse email complète (ex: avis-abc123@avisprofr.com)
 * @returns Le mapping établissement ou null si non trouvé
 */
export async function resolveEstablishmentFromAlias(
  email: string
): Promise<EstablishmentMapping | null> {
  try {
    // Extraire la partie locale de l'email (avant @)
    if (!email.includes("@")) {
      console.warn(`[RESOLVE_ESTABLISHMENT] Invalid email format: ${email}`);
      return null;
    }

    const [localPart, domain] = email.split("@");

    // Vérifier que c'est bien notre domaine
    if (domain !== "avisprofr.com") {
      console.warn(`[RESOLVE_ESTABLISHMENT] Email not from avisprofr.com domain: ${email}`);
      return null;
    }

    // L'alias est la partie locale (ex: avis-3f92b7a1)
    const alias = localPart.trim();

    if (!alias || alias === "") {
      console.warn(`[RESOLVE_ESTABLISHMENT] Empty alias extracted from: ${email}`);
      return null;
    }

    // Chercher l'établissement par incoming_alias (EXACT MATCH uniquement)
    const { data: businessProfiles, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id, nom_etablissement, ville, incoming_alias")
      .eq("incoming_alias", alias);

    if (error) {
      console.error(`[RESOLVE_ESTABLISHMENT] Database error: ${error.message}`);
      return null;
    }

    // Vérifier qu'il n'y a qu'un seul résultat (unicité garantie par la contrainte UNIQUE, mais on vérifie)
    if (!businessProfiles || businessProfiles.length === 0) {
      console.warn(`[RESOLVE_ESTABLISHMENT] No business profile found for alias: ${alias} (email: ${email})`);
      return null;
    }

    if (businessProfiles.length > 1) {
      // CRITIQUE : Plusieurs établissements avec le même alias (ne devrait jamais arriver)
      console.error(`[RESOLVE_ESTABLISHMENT] CRITICAL: Multiple business profiles found for alias: ${alias}`);
      console.error(`[RESOLVE_ESTABLISHMENT] Found ${businessProfiles.length} profiles:`, businessProfiles.map(p => p.id));
      
      // En cas de collision, on ne peut pas déterminer lequel utiliser
      // On retourne null pour éviter toute association incorrecte
      return null;
    }

    const businessProfile = businessProfiles[0];

    // Vérifier que l'établissement a bien un user_id valide
    if (!businessProfile.user_id) {
      console.error(`[RESOLVE_ESTABLISHMENT] Business profile ${businessProfile.id} has no user_id`);
      return null;
    }

    // Vérifier que l'alias correspond bien
    if (businessProfile.incoming_alias !== alias) {
      console.error(`[RESOLVE_ESTABLISHMENT] Alias mismatch: expected ${alias}, got ${businessProfile.incoming_alias}`);
      return null;
    }

    console.log(`[RESOLVE_ESTABLISHMENT] Successfully resolved alias ${alias} to establishment ${businessProfile.id} (user: ${businessProfile.user_id})`);

    return {
      userId: businessProfile.user_id,
      establishmentId: businessProfile.id,
      businessProfile: {
        id: businessProfile.id,
        nom_etablissement: businessProfile.nom_etablissement,
        ville: businessProfile.ville,
        user_id: businessProfile.user_id,
      },
    };
  } catch (error: any) {
    console.error(`[RESOLVE_ESTABLISHMENT] Error resolving establishment from alias: ${error.message}`, error);
    return null;
  }
}

/**
 * Valide qu'un établissement appartient bien à un utilisateur
 * Double vérification de sécurité
 */
export async function validateEstablishmentOwnership(
  establishmentId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("business_profiles")
      .select("user_id")
      .eq("id", establishmentId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.warn(`[VALIDATE_OWNERSHIP] Ownership validation failed: ${establishmentId} / ${userId}`);
      return false;
    }

    const isValid = data.user_id === userId;
    
    if (!isValid) {
      console.error(`[VALIDATE_OWNERSHIP] SECURITY: Ownership mismatch - Establishment ${establishmentId} does not belong to user ${userId}`);
    }

    return isValid;
  } catch (error: any) {
    console.error(`[VALIDATE_OWNERSHIP] Error validating ownership: ${error.message}`);
    return false;
  }
}
