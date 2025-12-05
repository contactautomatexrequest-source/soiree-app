import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Vérifie si un email est déjà utilisé
 * POST /api/auth/check-email
 * Body: { email: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Normaliser l'email (minuscules, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Utiliser l'admin client pour vérifier si l'email existe déjà
    // On liste les utilisateurs avec cet email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Erreur lors de la liste des utilisateurs:", listError);
      // En cas d'erreur, on retourne que l'email est disponible
      // pour ne pas bloquer l'inscription
      return NextResponse.json({ 
        available: true,
        error: "Impossible de vérifier l'email. L'inscription sera vérifiée par Supabase."
      });
    }

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = users.users.find(
      (user) => user.email?.toLowerCase().trim() === normalizedEmail
    );

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: "Un compte existe déjà avec cet email.",
        userExists: true,
      });
    }

    return NextResponse.json({ 
      available: true,
      message: "Email disponible."
    });
  } catch (error: any) {
    console.error("Erreur lors de la vérification de l'email:", error);
    // En cas d'erreur, on retourne que l'email est disponible
    // pour ne pas bloquer l'inscription (Supabase gérera l'unicité)
    return NextResponse.json(
      { 
        available: true,
        error: "Erreur lors de la vérification. L'inscription sera vérifiée par Supabase."
      },
      { status: 200 }
    );
  }
}

