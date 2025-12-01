import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

interface ExtractedReview {
  reviewText: string;
  rating?: number;
  reviewerName?: string;
  reviewDate?: Date;
}

/**
 * Extrait les informations d'un avis depuis le contenu d'un email
 * Utilise OpenAI pour une extraction robuste
 */
export async function extractReviewFromEmail(
  emailSubject: string,
  emailBody: string
): Promise<ExtractedReview | null> {
  try {
    // Essayer d'abord une extraction simple par regex
    const simpleExtraction = extractReviewSimple(emailSubject, emailBody);
    if (simpleExtraction) {
      return simpleExtraction;
    }

    // Si l'extraction simple échoue, utiliser OpenAI (si disponible)
    if (!openai) {
      // Si OpenAI n'est pas configuré, retourner l'extraction simple
      return simpleExtraction;
    }

    const prompt = `Tu es un assistant qui extrait les informations d'un avis Google depuis un email de notification.

Email reçu:
Sujet: ${emailSubject}
Corps: ${emailBody.substring(0, 2000)}

Extrais les informations suivantes au format JSON:
{
  "reviewText": "le texte de l'avis",
  "rating": 1-5 (ou null si non trouvé),
  "reviewerName": "nom du client" (ou null),
  "reviewDate": "YYYY-MM-DD" (ou null)
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant qui extrait des informations structurées depuis des emails. Réponds uniquement en JSON valide.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    // Parser le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const extracted = JSON.parse(jsonMatch[0]);
    
    return {
      reviewText: extracted.reviewText || emailBody.substring(0, 500),
      rating: extracted.rating ? parseInt(extracted.rating, 10) : undefined,
      reviewerName: extracted.reviewerName || undefined,
      reviewDate: extracted.reviewDate ? new Date(extracted.reviewDate) : undefined,
    };
  } catch (error) {
    console.error("Error extracting review from email:", error);
    // En cas d'erreur, retourner au moins le texte brut
    return {
      reviewText: emailBody.substring(0, 500),
    };
  }
}

/**
 * Extraction simple par regex (plus rapide, moins coûteux)
 */
function extractReviewSimple(subject: string, body: string): ExtractedReview | null {
  // Chercher la note (1-5 étoiles)
  const ratingMatch = body.match(/(\d+)\s*(?:étoile|star|★|⭐)/i);
  const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : undefined;

  // Chercher le texte de l'avis (entre guillemets ou après certains patterns)
  let reviewText = "";
  
  // Pattern 1: Texte entre guillemets
  const quotedMatch = body.match(/"([^"]{10,})"/);
  if (quotedMatch) {
    reviewText = quotedMatch[1].trim();
  }
  
  // Pattern 2: Après "avis:" ou "review:"
  if (!reviewText) {
    const afterLabelMatch = body.match(/(?:avis|review)[:\s]+([\s\S]+?)(?:\n\n|\r\n\r\n|$)/i);
    if (afterLabelMatch) {
      reviewText = afterLabelMatch[1].trim();
    }
  }
  
  // Pattern 3: Prendre un extrait si rien d'autre
  if (!reviewText) {
    reviewText = body.substring(0, 500).trim();
  }

  // Nettoyer le texte
  reviewText = reviewText
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!reviewText || reviewText.length < 10) {
    return null;
  }

  // Extraire le nom du reviewer
  const reviewerMatch = body.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:a\s+laissé|left)/i);
  const reviewerName = reviewerMatch ? reviewerMatch[1] : undefined;

  return {
    reviewText,
    rating,
    reviewerName,
  };
}

