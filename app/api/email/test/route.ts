import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Resend n'est pas configuré" },
        { status: 500 }
      );
    }

    // Envoyer un email de test
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@reponsia.fr",
      to: email,
      subject: "Test - AvisPro",
      html: `
        <h2>Email de test</h2>
        <p>Si tu reçois cet email, le transfert fonctionne correctement !</p>
        <p>Les prochains avis Google transférés vers cette adresse seront automatiquement importés dans ton application.</p>
      `,
      text: "Si tu reçois cet email, le transfert fonctionne correctement ! Les prochains avis Google transférés vers cette adresse seront automatiquement importés dans ton application.",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'envoi du test" },
      { status: 500 }
    );
  }
}

