import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AvisPro — La protection automatique de ta réputation.",
  description: "Tes avis Google gérés automatiquement. Réponses professionnelles en quelques secondes grâce à l'intelligence artificielle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
