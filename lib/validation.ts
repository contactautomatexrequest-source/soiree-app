import { z } from "zod";

// Schéma pour la création d'un profil business
export const BusinessProfileSchema = z.object({
  metier: z.enum(["restaurant", "coiffeur", "garage", "photographe", "coach"]),
  nom_etablissement: z.string().min(1, "Le nom est requis").max(200),
  ville: z.string().min(1, "La ville est requise").max(100),
  ton_marque: z.enum(["neutre", "chaleureux", "premium", "commercial"]),
});

// Schéma pour la génération d'une réponse
export const GenerateResponseSchema = z.object({
  contenu_avis: z.string().min(10, "L'avis doit contenir au moins 10 caractères").max(5000),
  note: z.number().int().min(1).max(5).optional(),
  business_id: z.string().uuid(),
  review_id: z.string().uuid().optional(), // ID de l'avis existant (pour éviter de créer un doublon)
});

// Schéma pour la mise à jour du profil
export const UpdateBusinessProfileSchema = BusinessProfileSchema.partial();

