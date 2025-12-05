/**
 * Validateur et vérificateur d'alias emails
 * Garantit l'intégrité du système d'alias
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface AliasValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valide qu'un alias est correctement formaté
 */
export function validateAliasFormat(alias: string): boolean {
  if (!alias || alias.trim() === "") {
    return false;
  }

  // Format attendu : avis-{alphanumeric}
  const aliasPattern = /^avis-[a-f0-9]{6,32}$/i;
  return aliasPattern.test(alias);
}

/**
 * Vérifie qu'un alias est unique dans la base
 */
export async function validateAliasUniqueness(alias: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabaseAdmin
      .from("business_profiles")
      .select("id")
      .eq("incoming_alias", alias);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking alias uniqueness:", error);
      return false;
    }

    return data.length === 0;
  } catch (error) {
    console.error("Error validating alias uniqueness:", error);
    return false;
  }
}

/**
 * Vérifie qu'un établissement a bien un alias valide
 */
export async function validateBusinessProfileAlias(businessId: string): Promise<AliasValidationResult> {
  const result: AliasValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const { data: profile, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, incoming_alias, user_id, nom_etablissement")
      .eq("id", businessId)
      .single();

    if (error || !profile) {
      result.isValid = false;
      result.errors.push(`Business profile ${businessId} not found`);
      return result;
    }

    // Vérifier que l'alias existe
    if (!profile.incoming_alias || profile.incoming_alias.trim() === "") {
      result.isValid = false;
      result.errors.push(`Business profile ${businessId} has no incoming_alias`);
      return result;
    }

    // Vérifier le format
    if (!validateAliasFormat(profile.incoming_alias)) {
      result.isValid = false;
      result.errors.push(`Invalid alias format: ${profile.incoming_alias}`);
    }

    // Vérifier l'unicité
    const isUnique = await validateAliasUniqueness(profile.incoming_alias, businessId);
    if (!isUnique) {
      result.isValid = false;
      result.errors.push(`Alias ${profile.incoming_alias} is not unique`);
    }

    // Vérifier que l'établissement a un user_id
    if (!profile.user_id) {
      result.isValid = false;
      result.errors.push(`Business profile ${businessId} has no user_id`);
    }

    return result;
  } catch (error: any) {
    result.isValid = false;
    result.errors.push(`Error validating alias: ${error.message}`);
    return result;
  }
}

/**
 * Vérifie tous les établissements et retourne ceux qui ont des problèmes
 */
export async function validateAllBusinessProfiles(): Promise<{
  total: number;
  valid: number;
  invalid: Array<{
    id: string;
    nom_etablissement: string;
    errors: string[];
  }>;
}> {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("business_profiles")
      .select("id, incoming_alias, nom_etablissement, user_id");

    if (error) {
      throw error;
    }

    const invalid: Array<{ id: string; nom_etablissement: string; errors: string[] }> = [];
    let valid = 0;

    for (const profile of profiles || []) {
      const validation = await validateBusinessProfileAlias(profile.id);
      if (!validation.isValid) {
        invalid.push({
          id: profile.id,
          nom_etablissement: profile.nom_etablissement || "Unknown",
          errors: validation.errors,
        });
      } else {
        valid++;
      }
    }

    return {
      total: profiles?.length || 0,
      valid,
      invalid,
    };
  } catch (error: any) {
    console.error("Error validating all business profiles:", error);
    throw error;
  }
}

