"use client";

import type { BrandbookData } from "@/lib/types";

export type ImmersiveTheme = {
  primaryHex: string;
  accentHex: string;
  tertiaryHex: string;
  bg: string;
  border: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  isDark: boolean;
  allColors: string[];
};

type ImmersiveThemeProps = {
  immersive: boolean;
  theme: ImmersiveTheme;
  patternUrl?: string | null;
  atmosphereUrl?: string | null;
  watermarkUrl?: string | null;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgba(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(17,17,17,${a})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  const sRGB = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

export function getImmersiveTheme(data: BrandbookData): ImmersiveTheme {
  const primaryHex = data.colors?.primary?.[0]?.hex ?? "#111111";
  const accentHex = data.colors?.primary?.[1]?.hex ?? data.colors?.secondary?.[0]?.hex ?? "#e5e5e5";
  const tertiaryHex = data.colors?.secondary?.[0]?.hex ?? data.colors?.primary?.[1]?.hex ?? accentHex;
  const headingFont = data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "inherit";
  const bodyFont = data.typography?.primary?.name ?? data.typography?.ui?.name ?? "inherit";
  const isDark = luminance(primaryHex) < 0.35;

  const allColors = [
    ...(data.colors?.primary?.map((c) => c.hex) ?? []),
    ...(data.colors?.secondary?.map((c) => c.hex) ?? []),
  ].filter(Boolean).slice(0, 10);

  const bg = `linear-gradient(160deg, ${rgba(primaryHex, 0.12)} 0%, ${rgba(accentHex, 0.08)} 30%, rgba(255,255,255,0.95) 60%, ${rgba(tertiaryHex, 0.06)} 100%)`;
  const border = rgba(primaryHex, 0.22);
  const muted = rgba(primaryHex, 0.06);

  return { primaryHex, accentHex, tertiaryHex, bg, border, muted, headingFont, bodyFont, isDark, allColors };
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
      return tagline ? `Eu sou ${name}. Minha voz é minha assinatura — e ela começa por aqui: "${tagline}".` : `Eu sou ${name}. Minha voz é minha assinatura — consistente, reconhecível e humana.`;
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
  theme,
  patternUrl,
  atmosphereUrl,
  watermarkUrl,
}: ImmersiveThemeProps) {
  if (!immersive) return null;

  const P = theme.primaryHex;
  const A = theme.accentHex;
  const T = theme.tertiaryHex;

  return (
    <>
      <div className="bb-ornament bb-ornament-a" aria-hidden="true" />
      <div className="bb-ornament bb-ornament-b" aria-hidden="true" />
      <div className="bb-ornament bb-ornament-c" aria-hidden="true" />
      <style>{`
        /* ═══════ IMMERSIVE BASE ═══════ */
        #brandbook-content.bb-immersive {
          --bb-pattern-url: ${patternUrl ? `url(${JSON.stringify(patternUrl)})` : "none"};
          --bb-atmosphere-url: ${atmosphereUrl ? `url(${JSON.stringify(atmosphereUrl)})` : "none"};
          --bb-watermark-url: ${watermarkUrl ? `url(${JSON.stringify(watermarkUrl)})` : "none"};
          --bb-surface: rgba(255, 255, 255, 0.92);
          --bb-surface-strong: rgba(255, 255, 255, 0.96);
          --bb-shadow: 0 24px 64px ${rgba(P, 0.12)}, 0 4px 16px rgba(0,0,0,0.06);
          --bb-glow: ${rgba(P, 0.15)};

          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: var(--bb-bg);
          border-radius: 24px;
          padding-top: 1px;
          box-shadow: 0 10px 50px ${rgba(P, 0.10)}, 0 0 0 1px ${rgba(P, 0.08)};
        }

        /* atmosphere hero behind everything */
        #brandbook-content.bb-immersive::before {
          content: "";
          position: absolute;
          inset: -60px;
          background-image: var(--bb-atmosphere-url);
          background-size: cover;
          background-position: center;
          opacity: 0.18;
          transform: scale(1.05);
          filter: saturate(1.2) contrast(1.05) blur(2px);
          pointer-events: none;
          z-index: 0;
        }

        /* pattern texture overlay */
        #brandbook-content.bb-immersive::after {
          content: "";
          position: absolute;
          inset: -30%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 480px 480px;
          opacity: 0.10;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 1;
          animation: bb-drift 120s linear infinite;
        }

        @keyframes bb-drift {
          from { transform: translate(0, 0); }
          to { transform: translate(-480px, -480px); }
        }

        #brandbook-content.bb-immersive > *:not(.bb-ornament) {
          position: relative;
          z-index: 3;
        }

        /* hide decorations for PDF export */
        #brandbook-content.bb-immersive[data-exporting="1"]::before,
        #brandbook-content.bb-immersive[data-exporting="1"]::after,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-ornament,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-color-strip,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-cat-banner::before,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-cat-banner::after {
          display: none !important;
        }

        /* ═══════ FLOATING ORNAMENTS (mascot / watermark) ═══════ */
        #brandbook-content.bb-immersive .bb-ornament {
          position: absolute;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 2;
          filter: saturate(1.1) contrast(1.08);
        }

        #brandbook-content.bb-immersive .bb-ornament-a {
          width: 600px; height: 600px;
          top: -100px; right: -100px;
          opacity: 0.07;
          transform: rotate(12deg);
        }

        #brandbook-content.bb-immersive .bb-ornament-b {
          width: 500px; height: 500px;
          bottom: 20%; left: -120px;
          opacity: 0.05;
          transform: rotate(-15deg) scale(0.9);
        }

        #brandbook-content.bb-immersive .bb-ornament-c {
          width: 400px; height: 400px;
          bottom: -80px; right: 10%;
          opacity: 0.04;
          transform: rotate(8deg) scale(0.7);
        }

        /* ═══════ SECTION SHELLS ═══════ */
        #brandbook-content.bb-immersive .bb-section-shell {
          background: var(--bb-surface);
          border: 1px solid ${rgba(P, 0.15)};
          border-left: 4px solid ${P};
          border-radius: 20px;
          box-shadow: var(--bb-shadow);
          padding: 28px 28px 28px 24px;
          margin-bottom: 0;
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }

        #brandbook-content.bb-immersive .bb-section-shell::before {
          content: "";
          position: absolute;
          top: 0; right: 0;
          width: 200px; height: 200px;
          background: radial-gradient(circle at top right, ${rgba(P, 0.06)}, transparent 70%);
          pointer-events: none;
        }

        @media print {
          #brandbook-content.bb-immersive .bb-section-shell {
            display: contents;
          }
        }

        /* ═══════ TYPOGRAPHY ═══════ */
        #brandbook-content.bb-immersive h2 {
          color: ${P} !important;
          font-family: var(--bb-heading-font);
          letter-spacing: -0.02em;
          font-weight: 900;
        }

        #brandbook-content.bb-immersive h2::after {
          content: "";
          display: block;
          height: 4px;
          width: 72px;
          border-radius: 999px;
          background: linear-gradient(90deg, ${P}, ${A}, ${T});
          opacity: 0.85;
          margin-top: 12px;
        }

        #brandbook-content.bb-immersive h3 {
          font-family: var(--bb-heading-font);
          color: ${rgba(P, 0.85)};
        }

        #brandbook-content.bb-immersive p,
        #brandbook-content.bb-immersive span,
        #brandbook-content.bb-immersive li {
          font-family: var(--bb-body-font);
        }

        #brandbook-content.bb-immersive a:hover {
          color: ${P};
        }

        /* ═══════ BORDERS ═══════ */
        #brandbook-content.bb-immersive .border,
        #brandbook-content.bb-immersive .border-b,
        #brandbook-content.bb-immersive .border-t,
        #brandbook-content.bb-immersive .border-l,
        #brandbook-content.bb-immersive .border-r {
          border-color: ${rgba(P, 0.15)} !important;
        }

        #brandbook-content.bb-immersive .bg-white {
          background-color: var(--bb-surface) !important;
        }

        #brandbook-content.bb-immersive .bg-gray-50 {
          background-color: ${rgba(P, 0.04)} !important;
        }

        /* ═══════ CATEGORY BANNER ═══════ */
        #brandbook-content.bb-immersive .bb-cat-banner {
          background: linear-gradient(135deg, ${P} 0%, ${rgba(A, 0.9)} 100%);
          border-radius: 20px;
          padding: 32px 36px;
          margin-bottom: 24px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 48px ${rgba(P, 0.25)}, 0 4px 12px rgba(0,0,0,0.08);
        }

        #brandbook-content.bb-immersive .bb-cat-banner::before {
          content: "";
          position: absolute;
          inset: -50%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 400px 400px;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-cat-banner::after {
          content: "";
          position: absolute;
          bottom: -40px; right: -40px;
          width: 200px; height: 200px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
          transform: rotate(-10deg);
        }

        #brandbook-content.bb-immersive .bb-cat-banner > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive .bb-cat-banner h2 {
          color: ${theme.isDark ? "#fff" : "#111"} !important;
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        #brandbook-content.bb-immersive .bb-cat-banner h2::after {
          background: ${theme.isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"};
          width: 48px;
          height: 3px;
          margin-top: 14px;
        }

        #brandbook-content.bb-immersive .bb-cat-banner .bb-cat-back {
          color: ${theme.isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"};
        }

        #brandbook-content.bb-immersive .bb-cat-banner .bb-cat-back:hover {
          color: ${theme.isDark ? "#fff" : "#000"};
        }

        /* ═══════ VOICE QUOTE ═══════ */
        #brandbook-content.bb-immersive .bb-voice {
          border-left: 5px solid ${P};
          border-radius: 16px;
          background: linear-gradient(135deg, ${rgba(P, 0.08)}, ${rgba(A, 0.05)});
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 36px ${rgba(P, 0.10)};
          backdrop-filter: blur(8px);
        }

        #brandbook-content.bb-immersive .bb-voice::before {
          content: "";
          position: absolute;
          inset: -30%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 400px 400px;
          opacity: 0.08;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-voice > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive .bb-voice .bb-voice-text {
          font-family: var(--bb-heading-font);
          font-size: 1rem;
          line-height: 1.6;
          font-style: italic;
          color: ${rgba(P, 0.8)};
        }

        /* ═══════ COLOR STRIP DIVIDER ═══════ */
        #brandbook-content.bb-immersive .bb-color-strip {
          display: flex;
          height: 6px;
          border-radius: 999px;
          overflow: hidden;
          margin: 16px 0;
          box-shadow: 0 2px 8px ${rgba(P, 0.15)};
        }

        #brandbook-content.bb-immersive .bb-color-strip > span {
          flex: 1;
          transition: flex 0.3s ease;
        }

        #brandbook-content.bb-immersive .bb-color-strip:hover > span {
          flex: 1.2;
        }

        /* ═══════ SUMÁRIO ═══════ */
        #brandbook-content.bb-immersive #sumario {
          position: relative;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card {
          position: relative;
          overflow: hidden;
          border: 1px solid ${rgba(P, 0.12)};
          border-top: 3px solid ${P};
          background: var(--bb-surface);
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px ${rgba(P, 0.15)};
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 300px 300px;
          opacity: 0.05;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-cat {
          color: ${P};
          font-family: var(--bb-heading-font);
        }

        #brandbook-content.bb-immersive #sumario a {
          border-radius: 10px;
          transition: background 0.15s ease;
        }

        #brandbook-content.bb-immersive #sumario a:hover {
          background: ${rgba(P, 0.08)} !important;
        }

        #brandbook-content.bb-immersive #sumario a .bb-num {
          color: ${P};
          font-weight: 800;
          font-family: var(--bb-heading-font);
        }

        /* ═══════ BRAND WATERMARK TEXT ═══════ */
        #brandbook-content.bb-immersive .bb-brand-watermark {
          position: absolute;
          font-family: var(--bb-heading-font);
          font-weight: 900;
          font-size: 8rem;
          letter-spacing: -0.04em;
          color: ${rgba(P, 0.03)};
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
          z-index: 0;
        }

        /* ═══════ FOOTER BRAND BAR ═══════ */
        #brandbook-content.bb-immersive .bb-brand-footer {
          background: linear-gradient(135deg, ${P}, ${A});
          border-radius: 16px;
          padding: 24px 32px;
          margin-top: 48px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px ${rgba(P, 0.20)};
        }

        #brandbook-content.bb-immersive .bb-brand-footer::before {
          content: "";
          position: absolute;
          inset: -50%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 300px 300px;
          opacity: 0.10;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-brand-footer > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
}
