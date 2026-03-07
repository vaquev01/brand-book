import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

export const dynamic = "force-dynamic";

function resolveMetadataBase() {
  const headerStore = headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto")
    ?? (host && /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host) ? "http" : "https");

  if (host) {
    try {
      return new URL(`${proto}://${host}`);
    } catch {
    }
  }

  return new URL("http://localhost:3005");
}

export function generateMetadata(): Metadata {
  return {
    title: "Brandbook Builder | Gerador de Manual de Marca Profissional",
    description: "Gere manuais de marca completos e profissionais para qualquer tipo de negócio usando IA.",
    applicationName: "Brandbook Builder",
    metadataBase: resolveMetadataBase(),
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
