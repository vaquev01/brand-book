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

type ImmersiveThemeProps = {
  immersive: boolean;
  patternUrl?: string | null;
  atmosphereUrl?: string | null;
  watermarkUrl?: string | null;
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
    case "governance":
      return `Eu sou ${name}. Eu cresço com consistência: versionamento, ownership e processo — para manter meu sistema vivo e escalável.`;
    default:
      return `Eu sou ${name}. Este é o meu sistema: eu mantenho consistência, clareza e identidade em cada detalhe.`;
  }
}

export function BrandImmersiveTheme({
  immersive,
  patternUrl,
  atmosphereUrl,
  watermarkUrl,
}: ImmersiveThemeProps) {
  if (!immersive) return null;
  return (
    <>
      <div className="bb-ornament bb-ornament-a" aria-hidden="true" />
      <div className="bb-ornament bb-ornament-b" aria-hidden="true" />
      <style>{`
        #brandbook-content.bb-immersive {
          --bb-pattern-url: ${patternUrl ? `url(${JSON.stringify(patternUrl)})` : "none"};
          --bb-atmosphere-url: ${atmosphereUrl ? `url(${JSON.stringify(atmosphereUrl)})` : "none"};
          --bb-watermark-url: ${watermarkUrl ? `url(${JSON.stringify(watermarkUrl)})` : "none"};
          --bb-surface: rgba(255, 255, 255, 0.88);
          --bb-surface-strong: rgba(255, 255, 255, 0.94);
          --bb-shadow: 0 18px 55px rgba(0,0,0,0.10);

          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: var(--bb-bg);
          border-radius: 18px;
          padding-top: 1px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        #brandbook-content.bb-immersive::before {
          content: "";
          position: absolute;
          inset: -40px;
          background-image: var(--bb-atmosphere-url);
          background-size: cover;
          background-position: center;
          opacity: 0.20;
          transform: scale(1.03);
          filter: saturate(1.10) contrast(1.03);
          pointer-events: none;
          z-index: 0;
        }

        #brandbook-content.bb-immersive::after {
          content: "";
          position: absolute;
          inset: -25%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 560px 560px;
          opacity: 0.14;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 1;
        }

        #brandbook-content.bb-immersive > *:not(.bb-ornament) {
          position: relative;
          z-index: 3;
        }

        #brandbook-content.bb-immersive[data-exporting="1"]::before,
        #brandbook-content.bb-immersive[data-exporting="1"]::after,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-ornament {
          display: none !important;
        }

        #brandbook-content.bb-immersive .bb-ornament {
          position: absolute;
          width: 520px;
          height: 520px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.08;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 2;
          filter: saturate(1.05) contrast(1.05);
        }

        #brandbook-content.bb-immersive .bb-ornament-a {
          top: -130px;
          right: -120px;
          transform: rotate(10deg);
        }

        #brandbook-content.bb-immersive .bb-ornament-b {
          bottom: -160px;
          left: -140px;
          transform: rotate(-12deg) scale(0.92);
          opacity: 0.06;
        }

        #brandbook-content.bb-immersive .border,
        #brandbook-content.bb-immersive .border-b,
        #brandbook-content.bb-immersive .border-t,
        #brandbook-content.bb-immersive .border-l,
        #brandbook-content.bb-immersive .border-r {
          border-color: var(--bb-border) !important;
        }

        #brandbook-content.bb-immersive .bg-white {
          background-color: var(--bb-surface) !important;
        }

        #brandbook-content.bb-immersive .bg-gray-50 {
          background-color: rgba(255,255,255,0.72) !important;
        }

        #brandbook-content.bb-immersive h2 {
          color: var(--bb-primary) !important;
          font-family: var(--bb-heading-font);
          letter-spacing: -0.01em;
        }

        #brandbook-content.bb-immersive h2::after {
          content: "";
          display: block;
          height: 3px;
          width: 62px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--bb-primary), var(--bb-accent));
          opacity: 0.75;
          margin-top: 10px;
        }

        #brandbook-content.bb-immersive h3 {
          font-family: var(--bb-heading-font);
        }

        #brandbook-content.bb-immersive a:hover {
          color: var(--bb-primary);
        }

        #brandbook-content.bb-immersive .bb-section-shell {
          background: var(--bb-surface);
          border: 1px solid var(--bb-border);
          border-radius: 22px;
          box-shadow: var(--bb-shadow);
          padding: 22px;
          margin-bottom: 0;
          backdrop-filter: blur(10px);
        }

        @media print {
          #brandbook-content.bb-immersive .bb-section-shell {
            display: contents;
          }
        }

        #brandbook-content.bb-immersive .bb-voice {
          border-left: 5px solid var(--bb-primary);
          background: var(--bb-surface-strong);
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        #brandbook-content.bb-immersive .bb-voice::before {
          content: "";
          position: absolute;
          inset: -30%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 520px 520px;
          opacity: 0.10;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-voice > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive #sumario .bg-white {
          position: relative;
          overflow: hidden;
        }

        #brandbook-content.bb-immersive #sumario .bg-white::before {
          content: "";
          position: absolute;
          inset: -25%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 560px 560px;
          opacity: 0.10;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive #sumario .bg-white > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
}
