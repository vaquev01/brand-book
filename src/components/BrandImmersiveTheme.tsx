"use client";

import type { BrandbookData } from "@/lib/types";

type ImmersiveTheme = {
  primaryHex: string;
  accentHex: string;
  bg: string;
  border: string;
  muted: string;
  headingFont: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgba(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(17,17,17,${a})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

export function getImmersiveTheme(data: BrandbookData): ImmersiveTheme {
  const primaryHex = data.colors?.primary?.[0]?.hex ?? "#111111";
  const accentHex = data.colors?.primary?.[1]?.hex ?? data.colors?.secondary?.[0]?.hex ?? "#e5e5e5";
  const headingFont = data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "inherit";

  const bg = `linear-gradient(135deg, ${rgba(primaryHex, 0.08)} 0%, ${rgba(accentHex, 0.06)} 45%, rgba(255,255,255,0.9) 100%)`;
  const border = rgba(primaryHex, 0.18);
  const muted = rgba(primaryHex, 0.08);

  return { primaryHex, accentHex, bg, border, muted, headingFont };
}

function pick(arr: string[] | undefined, n: number): string {
  if (!arr || arr.length === 0) return "";
  return arr.slice(0, n).join(", ");
}

export function brandVoiceQuote(sectionId: string, data: BrandbookData): string | null {
  const name = data.brandName;
  const purpose = data.brandConcept?.purpose;
  const tone = data.brandConcept?.toneOfVoice;
  const personality = pick(data.brandConcept?.personality, 3);
  const tagline = data.verbalIdentity?.tagline;
  const positioning = data.positioning?.positioningStatement;

  switch (sectionId) {
    case "dna":
      return `Eu sou ${name}. Meu propósito é ${purpose}. Minha personalidade é ${personality}. Meu tom é ${tone}.`;
    case "brand-story":
      return `Eu sou ${name}. Esta é a minha história — o que eu acredito e o que eu prometo ao mundo.`;
    case "positioning":
      return positioning ? `Eu sou ${name}. Meu posicionamento é claro: ${positioning}` : `Eu sou ${name}. Meu posicionamento é claro e consistente em todos os pontos de contato.`;
    case "verbal-identity":
      return tagline ? `Eu sou ${name}. Minha voz é minha assinatura — e ela começa por aqui: “${tagline}”.` : `Eu sou ${name}. Minha voz é minha assinatura — consistente, reconhecível e humana.`;
    case "logo":
      return `Eu sou ${name}. Minha identidade visual é meu rosto — clareza, consistência e legibilidade sempre.`;
    case "colors":
      return `Eu sou ${name}. Minhas cores não são decoração: elas carregam significado, contraste e consistência.`;
    case "typography":
    case "typography-scale":
      return `Eu sou ${name}. Minha tipografia é a minha voz escrita — ritmo, hierarquia e personalidade em cada linha.`;
    case "key-visual":
      return `Eu sou ${name}. Meu universo visual cria atmosfera — textura, luz, composição e símbolos do meu mundo.`;
    case "mascots":
      return `Eu sou ${name}. Meus personagens, símbolos e padrões ampliam minha identidade sem perder consistência.`;
    case "applications":
      return `Eu sou ${name}. Cada aplicação respeita meu sistema visual e meu tom — do cardápio ao uniforme.`;
    default:
      return null;
  }
}

export function BrandImmersiveTheme({ immersive }: { immersive: boolean }) {
  if (!immersive) return null;
  return (
    <style>{`
      #brandbook-content.bb-immersive {
        background: var(--bb-bg);
        border-radius: 18px;
        padding-top: 1px;
      }

      #brandbook-content.bb-immersive .border,
      #brandbook-content.bb-immersive .border-b,
      #brandbook-content.bb-immersive .border-t,
      #brandbook-content.bb-immersive .border-l,
      #brandbook-content.bb-immersive .border-r {
        border-color: var(--bb-border) !important;
      }

      #brandbook-content.bb-immersive .bg-white {
        background-color: rgba(255,255,255,0.90) !important;
      }

      #brandbook-content.bb-immersive .bg-gray-50 {
        background-color: rgba(255,255,255,0.70) !important;
      }

      #brandbook-content.bb-immersive h2 {
        color: var(--bb-primary) !important;
        font-family: var(--bb-heading-font);
      }

      #brandbook-content.bb-immersive h3 {
        font-family: var(--bb-heading-font);
      }

      #brandbook-content.bb-immersive a:hover {
        color: var(--bb-primary);
      }

      #brandbook-content.bb-immersive .bb-voice {
        border-left: 4px solid var(--bb-primary);
        background: var(--bb-muted);
      }
    `}</style>
  );
}
