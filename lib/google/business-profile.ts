/**
 * Google Business Profile API Client
 * Synchronisation automatique des données Google Business
 */

interface GoogleBusinessProfile {
  placeId: string;
  displayName: string;
  primaryCategory: string;
  formattedAddress: string;
  addressComponents: {
    locality?: string; // Ville
    postalCode?: string;
    country?: string;
  };
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      uri: string;
    }>;
  }>;
}

interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  rating: number;
  comment?: string;
  createTime: string;
  updateTime: string;
}

/**
 * Récupère le profil Google Business à partir d'un placeId
 */
export async function fetchGoogleBusinessProfile(
  placeId: string,
  accessToken: string
): Promise<GoogleBusinessProfile | null> {
  try {
    // Google Places API (New) - Get Place
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=fr&regionCode=FR`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Google API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return null;
    }

    const data = await response.json();
    
    return {
      placeId: data.id || placeId,
      displayName: data.displayName?.text || "",
      primaryCategory: data.types?.[0] || "",
      formattedAddress: data.formattedAddress || "",
      addressComponents: {
        locality: data.addressComponents?.find((c: any) => c.types?.includes("locality"))?.longText,
        postalCode: data.addressComponents?.find((c: any) => c.types?.includes("postal_code"))?.longText,
        country: data.addressComponents?.find((c: any) => c.types?.includes("country"))?.longText,
      },
      websiteUri: data.websiteUri,
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      photos: data.photos,
    };
  } catch (error) {
    console.error("Error fetching Google Business Profile:", error);
    return null;
  }
}

/**
 * Récupère les avis Google Business à partir d'un placeId
 */
export async function fetchGoogleReviews(
  placeId: string,
  accessToken: string
): Promise<GoogleReview[]> {
  try {
    // Google Places API (New) - Get Reviews
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}/reviews?languageCode=fr&regionCode=FR`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Google Reviews API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const reviews: GoogleReview[] = [];

    if (data.reviews && Array.isArray(data.reviews)) {
      for (const review of data.reviews) {
        reviews.push({
          reviewId: review.name?.split("/").pop() || "",
          reviewer: {
            displayName: review.reviewer?.displayName || "Utilisateur Google",
            profilePhotoUrl: review.reviewer?.profilePhotoUri,
          },
          rating: review.rating || 0,
          comment: review.text?.text || "",
          createTime: review.createTime || "",
          updateTime: review.updateTime || "",
        });
      }
    }

    return reviews;
  } catch (error) {
    console.error("Error fetching Google Reviews:", error);
    return [];
  }
}

/**
 * Rafraîchit un access token Google OAuth
 */
export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("Error refreshing Google token:", response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return null;
  }
}

/**
 * Vérifie si un access token est expiré
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

