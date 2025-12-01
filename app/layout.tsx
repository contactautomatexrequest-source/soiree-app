import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RéponsIA Avis - Répondez aux avis Google avec l'IA",
  description: "Générez des réponses professionnelles aux avis Google en quelques secondes grâce à l'intelligence artificielle.",
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
