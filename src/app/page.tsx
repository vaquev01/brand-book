import type { Metadata } from "next"
import { LandingClient } from "./LandingClient"

export const metadata: Metadata = {
  title: "Brandbook Builder | Manuais de Marca Profissionais com IA",
  description:
    "Gere manuais de marca completos que parecem feitos por uma agencia de R$50mil. IA com sensibilidade estetica gera brandbooks em minutos — do DNA estrategico aos assets prontos para uso.",
  openGraph: {
    title: "Brandbook Builder | Manuais de Marca Profissionais com IA",
    description:
      "IA com sensibilidade estetica gera brandbooks completos em minutos — do DNA estrategico aos assets prontos para uso.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brandbook Builder | Manuais de Marca Profissionais com IA",
    description:
      "IA com sensibilidade estetica gera brandbooks completos em minutos — do DNA estrategico aos assets prontos para uso.",
  },
  keywords: [
    "brandbook",
    "manual de marca",
    "identidade visual",
    "branding",
    "IA",
    "design",
    "brand guidelines",
  ],
}

export default function LandingPage() {
  return <LandingClient />
}
