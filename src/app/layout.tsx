import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brandbook Builder | Gerador de Manual de Marca Profissional",
  description: "Gere manuais de marca completos e profissionais para qualquer tipo de negócio usando IA.",
  applicationName: "Brandbook Builder",
  metadataBase: new URL("https://brand-book-production.up.railway.app"),
  icons: {
    icon: "/icon",
    apple: "/icon",
  },
  openGraph: {
    title: "Brandbook Builder | Gerador de Manual de Marca Profissional",
    description: "Gere manuais de marca completos e profissionais para qualquer tipo de negócio usando IA.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brandbook Builder | Gerador de Manual de Marca Profissional",
    description: "Gere manuais de marca completos e profissionais para qualquer tipo de negócio usando IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}
