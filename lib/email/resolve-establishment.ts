/**
 * Résout un alias email vers un établissement
 * Fonction utilitaire centrale pour le mapping alias → établissement
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
 * @param email - L'adresse email complète (ex: avis-abc123@avisprofr.com ou salonxy@avisprofr.com)
 * @returns Le mapping établissement ou null si non trouvé
 */
export async function resolveEstablishmentFromAlias(
  email: string
): Promise<EstablishmentMapping | null> {
  try {
    // Extraire la partie locale de l'email (avant @)
    if (!email.includes("@")) {
      console.warn(`Invalid email format: ${email}`);
      return null;
    }

    const [localPart, domain] = email.split("@");

    // Vérifier que c'est bien notre domaine
    if (domain !== "avisprofr.com") {
      console.warn(`Email not from avisprofr.com domain: ${email}`);
      return null;
    }

    // L'alias peut être :
    // 1. Format standard : avis-{short_uuid} (ex: avis-3f92b7)
    // 2. Format personnalisé : n'importe quoi (ex: salonxy)
    // Dans tous les cas, on cherche dans incoming_alias
    let alias = localPart;

    // Si c'est au format avis-{id}, utiliser tel quel
    // Sinon, utiliser la partie locale comme alias
    if (!alias.startsWith("avis-")) {
      // Pour les alias personnalisés, on peut aussi chercher directement
      alias = localPart;
    }

    // Chercher l'établissement par incoming_alias
    const { data: businessProfile, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, user_id, nom_etablissement, ville")
      .eq("incoming_alias", alias)
      .single();

    if (error || !businessProfile) {
      // Log pour debug mais ne pas exposer d'erreur sensible
      console.warn(`No business profile found for alias: ${alias}`);
      return null;
    }

    // Vérifier que l'établissement a bien un user_id valide
    if (!businessProfile.user_id) {
      console.error(`Business profile ${businessProfile.id} has no user_id`);
      return null;
    }

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
  } catch (error) {
    console.error("Error resolving establishment from alias:", error);
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
      return false;
    }

    return data.user_id === userId;
  } catch (error) {
    console.error("Error validating establishment ownership:", error);
    return false;
  }
}

