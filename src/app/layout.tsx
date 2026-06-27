import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contactez l'agence",
  description: "Formulaire de contact de l'agence immobilière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#EDEAE3]">{children}</body>
    </html>
  );
}
