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
  const dk = theme.isDark;
  const bannerText = dk ? "#fff" : "#111";
  const bannerSub = dk ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)";

  return (
    <>
      <div className="bb-ornament bb-ornament-a" aria-hidden="true" />
      <div className="bb-ornament bb-ornament-b" aria-hidden="true" />
      <div className="bb-ornament bb-ornament-c" aria-hidden="true" />
      <div className="bb-noise" aria-hidden="true" />
      <style>{`
        /* ═══════ IMMERSIVE BASE ═══════ */
        #brandbook-content.bb-immersive {
          --bb-pattern-url: ${patternUrl ? `url(${JSON.stringify(patternUrl)})` : "none"};
          --bb-atmosphere-url: ${atmosphereUrl ? `url(${JSON.stringify(atmosphereUrl)})` : "none"};
          --bb-watermark-url: ${watermarkUrl ? `url(${JSON.stringify(watermarkUrl)})` : "none"};
          --bb-surface: rgba(255, 255, 255, 0.88);
          --bb-surface-strong: rgba(255, 255, 255, 0.94);
          --bb-shadow: 0 24px 64px ${rgba(P, 0.14)}, 0 4px 16px rgba(0,0,0,0.07);
          --bb-glow: ${rgba(P, 0.18)};

          position: relative;
          isolation: isolate;
          overflow: hidden;
          background: var(--bb-bg);
          border-radius: 28px;
          padding-top: 1px;
          box-shadow:
            0 10px 60px ${rgba(P, 0.12)},
            0 0 0 1px ${rgba(P, 0.10)},
            inset 0 1px 0 rgba(255,255,255,0.6);
        }

        /* atmosphere hero behind everything */
        #brandbook-content.bb-immersive::before {
          content: "";
          position: absolute;
          inset: -80px;
          background-image: var(--bb-atmosphere-url);
          background-size: cover;
          background-position: center;
          opacity: 0.22;
          transform: scale(1.08);
          filter: saturate(1.3) contrast(1.08) blur(3px);
          pointer-events: none;
          z-index: 0;
        }

        /* pattern texture overlay */
        #brandbook-content.bb-immersive::after {
          content: "";
          position: absolute;
          inset: -40%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 420px 420px;
          opacity: 0.12;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 1;
          animation: bb-drift 100s linear infinite;
        }

        @keyframes bb-drift {
          from { transform: translate(0, 0); }
          to { transform: translate(-420px, -420px); }
        }

        #brandbook-content.bb-immersive > *:not(.bb-ornament):not(.bb-noise) {
          position: relative;
          z-index: 3;
        }

        /* ═══════ NOISE / GRAIN TEXTURE ═══════ */
        #brandbook-content.bb-immersive .bb-noise {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.035;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }

        /* hide decorations for PDF export */
        #brandbook-content.bb-immersive[data-exporting="1"]::before,
        #brandbook-content.bb-immersive[data-exporting="1"]::after,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-ornament,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-noise,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-color-strip,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-atmo-hero,
        #brandbook-content.bb-immersive[data-exporting="1"] .bb-section-mascot,
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
          filter: saturate(1.15) contrast(1.1);
        }

        #brandbook-content.bb-immersive .bb-ornament-a {
          width: 700px; height: 700px;
          top: -80px; right: -80px;
          opacity: 0.09;
          transform: rotate(12deg);
        }

        #brandbook-content.bb-immersive .bb-ornament-b {
          width: 550px; height: 550px;
          top: 35%; left: -140px;
          opacity: 0.06;
          transform: rotate(-18deg) scale(0.85);
        }

        #brandbook-content.bb-immersive .bb-ornament-c {
          width: 480px; height: 480px;
          bottom: 8%; right: -60px;
          opacity: 0.05;
          transform: rotate(6deg) scale(0.75);
        }

        /* ═══════ SECTION SHELLS ═══════ */
        #brandbook-content.bb-immersive .bb-section-shell {
          background: var(--bb-surface);
          border: 1px solid ${rgba(P, 0.13)};
          border-left: 5px solid ${P};
          border-radius: 22px;
          box-shadow: var(--bb-shadow);
          padding: 32px 32px 32px 28px;
          margin-bottom: 0;
          backdrop-filter: blur(20px) saturate(1.2);
          position: relative;
          overflow: hidden;
        }

        /* glow corner top-right */
        #brandbook-content.bb-immersive .bb-section-shell::before {
          content: "";
          position: absolute;
          top: -40px; right: -40px;
          width: 280px; height: 280px;
          background: radial-gradient(circle at center, ${rgba(P, 0.08)}, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        /* pattern texture inside section */
        #brandbook-content.bb-immersive .bb-section-shell::after {
          content: "";
          position: absolute;
          inset: -30%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 380px 380px;
          opacity: 0.04;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 0;
        }

        #brandbook-content.bb-immersive .bb-section-shell > * {
          position: relative;
          z-index: 1;
        }

        /* ═══════ INLINE MASCOT per section ═══════ */
        #brandbook-content.bb-immersive .bb-section-mascot {
          position: absolute;
          bottom: -30px; right: -20px;
          width: 200px; height: 200px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.06;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 0;
          transform: rotate(-8deg);
          filter: saturate(1.1);
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
          width: 80px;
          border-radius: 999px;
          background: linear-gradient(90deg, ${P}, ${A}, ${T});
          opacity: 0.9;
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
          background-color: ${rgba(P, 0.035)} !important;
        }

        /* ═══════ ATMOSPHERE HERO INTERLUDE ═══════ */
        #brandbook-content.bb-immersive .bb-atmo-hero {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          margin: 20px 0 8px;
          min-height: 180px;
          display: flex;
          align-items: flex-end;
          box-shadow: 0 20px 56px ${rgba(P, 0.20)}, inset 0 0 0 1px ${rgba(P, 0.12)};
        }

        #brandbook-content.bb-immersive .bb-atmo-hero .bb-atmo-img {
          position: absolute;
          inset: 0;
          background-image: var(--bb-atmosphere-url);
          background-size: cover;
          background-position: center;
          filter: saturate(1.25) contrast(1.05);
        }

        #brandbook-content.bb-immersive .bb-atmo-hero .bb-atmo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            ${rgba(P, 0.85)} 0%,
            ${rgba(P, 0.45)} 40%,
            transparent 100%
          );
        }

        #brandbook-content.bb-immersive .bb-atmo-hero .bb-atmo-pattern {
          position: absolute;
          inset: -40%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 320px 320px;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-atmo-hero .bb-atmo-mascot {
          position: absolute;
          right: 20px; bottom: 10px;
          width: 140px; height: 140px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.18;
          mix-blend-mode: overlay;
          transform: rotate(-5deg);
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-atmo-hero .bb-atmo-content {
          position: relative;
          z-index: 2;
          padding: 28px 32px;
          width: 100%;
        }

        /* ═══════ CATEGORY BANNER ═══════ */
        #brandbook-content.bb-immersive .bb-cat-banner {
          background: linear-gradient(135deg, ${P} 0%, ${rgba(A, 0.92)} 100%);
          border-radius: 22px;
          padding: 36px 40px;
          margin-bottom: 24px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 20px 56px ${rgba(P, 0.28)},
            0 4px 14px rgba(0,0,0,0.10),
            inset 0 1px 0 ${rgba("#ffffff", 0.15)};
        }

        #brandbook-content.bb-immersive .bb-cat-banner::before {
          content: "";
          position: absolute;
          inset: -60%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 350px 350px;
          opacity: 0.15;
          mix-blend-mode: overlay;
          pointer-events: none;
          animation: bb-drift 80s linear infinite;
        }

        #brandbook-content.bb-immersive .bb-cat-banner::after {
          content: "";
          position: absolute;
          bottom: -50px; right: -30px;
          width: 260px; height: 260px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.14;
          mix-blend-mode: overlay;
          pointer-events: none;
          transform: rotate(-10deg);
        }

        #brandbook-content.bb-immersive .bb-cat-banner > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive .bb-cat-banner h2 {
          color: ${bannerText} !important;
          font-size: 1.6rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        #brandbook-content.bb-immersive .bb-cat-banner h2::after {
          background: ${dk ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"};
          width: 56px;
          height: 3px;
          margin-top: 14px;
        }

        #brandbook-content.bb-immersive .bb-cat-banner .bb-cat-back {
          color: ${bannerSub};
        }

        #brandbook-content.bb-immersive .bb-cat-banner .bb-cat-back:hover {
          color: ${bannerText};
        }

        #brandbook-content.bb-immersive .bb-cat-banner .bb-cat-brand {
          color: ${bannerSub};
          font-family: var(--bb-heading-font);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        /* ═══════ VOICE QUOTE ═══════ */
        #brandbook-content.bb-immersive .bb-voice {
          border-left: 5px solid ${P};
          border-radius: 18px;
          background: linear-gradient(135deg, ${rgba(P, 0.10)}, ${rgba(A, 0.06)}, ${rgba(T, 0.04)});
          position: relative;
          overflow: hidden;
          box-shadow: 0 14px 40px ${rgba(P, 0.12)};
          backdrop-filter: blur(12px) saturate(1.1);
        }

        #brandbook-content.bb-immersive .bb-voice::before {
          content: "";
          position: absolute;
          inset: -40%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 360px 360px;
          opacity: 0.08;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-voice::after {
          content: "";
          position: absolute;
          right: -10px; bottom: -10px;
          width: 120px; height: 120px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.07;
          mix-blend-mode: multiply;
          pointer-events: none;
          transform: rotate(-12deg);
        }

        #brandbook-content.bb-immersive .bb-voice > * {
          position: relative;
          z-index: 1;
        }

        #brandbook-content.bb-immersive .bb-voice .bb-voice-text {
          font-family: var(--bb-heading-font);
          font-size: 1.05rem;
          line-height: 1.65;
          font-style: italic;
          color: ${rgba(P, 0.8)};
        }

        /* ═══════ COLOR STRIP DIVIDER ═══════ */
        #brandbook-content.bb-immersive .bb-color-strip {
          display: flex;
          height: 5px;
          border-radius: 999px;
          overflow: hidden;
          margin: 20px 0;
          box-shadow: 0 2px 10px ${rgba(P, 0.18)};
        }

        #brandbook-content.bb-immersive .bb-color-strip > span {
          flex: 1;
          transition: flex 0.3s ease;
        }

        #brandbook-content.bb-immersive .bb-color-strip:hover > span:first-child {
          flex: 2;
        }

        /* ═══════ SUMÁRIO ═══════ */
        #brandbook-content.bb-immersive #sumario {
          position: relative;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card {
          position: relative;
          overflow: hidden;
          border: 1px solid ${rgba(P, 0.12)};
          border-top: 4px solid ${P};
          background: var(--bb-surface);
          backdrop-filter: blur(12px) saturate(1.1);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px ${rgba(P, 0.18)};
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 260px 260px;
          opacity: 0.06;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive #sumario .bb-sumario-card .bb-sumario-mascot {
          position: absolute;
          bottom: -15px; right: -10px;
          width: 100px; height: 100px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.06;
          mix-blend-mode: multiply;
          pointer-events: none;
          transform: rotate(-8deg);
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
          border-radius: 22px;
          padding: 32px 40px;
          margin-top: 48px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 16px 48px ${rgba(P, 0.24)},
            inset 0 1px 0 ${rgba("#ffffff", 0.15)};
        }

        #brandbook-content.bb-immersive .bb-brand-footer::before {
          content: "";
          position: absolute;
          inset: -60%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 280px 280px;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
          animation: bb-drift 80s linear infinite;
        }

        #brandbook-content.bb-immersive .bb-brand-footer::after {
          content: "";
          position: absolute;
          right: -30px; bottom: -20px;
          width: 180px; height: 180px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
          transform: rotate(-8deg);
        }

        #brandbook-content.bb-immersive .bb-brand-footer > * {
          position: relative;
          z-index: 1;
        }

        /* ═══════ SECTION HERO IMAGE ═══════ */
        #brandbook-content.bb-immersive .bb-section-hero {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 16px 48px ${rgba(P, 0.18)};
        }

        #brandbook-content.bb-immersive .bb-section-hero img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 320px;
          object-fit: cover;
          filter: saturate(1.1) contrast(1.02);
        }

        #brandbook-content.bb-immersive .bb-section-hero .bb-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            ${rgba(P, 0.55)} 0%,
            transparent 50%
          );
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-section-hero .bb-hero-label {
          position: absolute;
          bottom: 16px; left: 20px;
          font-family: var(--bb-heading-font);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.8);
          z-index: 1;
        }

        /* ═══════ PATTERN BAND ═══════ */
        #brandbook-content.bb-immersive .bb-pattern-band {
          position: relative;
          height: 80px;
          border-radius: 16px;
          overflow: hidden;
          margin: 24px 0;
          background: linear-gradient(135deg, ${rgba(P, 0.08)}, ${rgba(A, 0.06)});
          box-shadow: inset 0 0 0 1px ${rgba(P, 0.10)};
        }

        #brandbook-content.bb-immersive .bb-pattern-band .bb-band-pattern {
          position: absolute;
          inset: -50%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.25;
          mix-blend-mode: multiply;
          animation: bb-drift 60s linear infinite;
        }

        #brandbook-content.bb-immersive .bb-pattern-band .bb-band-mascot {
          position: absolute;
          right: 20px; top: 50%;
          transform: translateY(-50%);
          width: 60px; height: 60px;
          background-image: var(--bb-watermark-url);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.12;
          mix-blend-mode: multiply;
        }

        #brandbook-content.bb-immersive .bb-pattern-band .bb-band-name {
          position: absolute;
          left: 24px; top: 50%;
          transform: translateY(-50%);
          font-family: var(--bb-heading-font);
          font-weight: 900;
          font-size: 1.4rem;
          color: ${rgba(P, 0.12)};
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ═══════ ASSET GALLERY STRIP ═══════ */
        #brandbook-content.bb-immersive .bb-asset-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 0 16px;
          margin: 16px 0;
          scrollbar-width: thin;
          scrollbar-color: ${rgba(P, 0.2)} transparent;
        }

        #brandbook-content.bb-immersive .bb-asset-strip::-webkit-scrollbar {
          height: 4px;
        }

        #brandbook-content.bb-immersive .bb-asset-strip::-webkit-scrollbar-thumb {
          background: ${rgba(P, 0.2)};
          border-radius: 2px;
        }

        #brandbook-content.bb-immersive .bb-asset-strip .bb-strip-item {
          flex: 0 0 auto;
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 24px ${rgba(P, 0.12)};
          border: 1px solid ${rgba(P, 0.10)};
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        #brandbook-content.bb-immersive .bb-asset-strip .bb-strip-item:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 36px ${rgba(P, 0.18)};
        }

        #brandbook-content.bb-immersive .bb-asset-strip .bb-strip-item img {
          display: block;
          height: 160px;
          width: auto;
          min-width: 160px;
          object-fit: cover;
        }

        #brandbook-content.bb-immersive .bb-asset-strip .bb-strip-label {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 6px 10px;
          background: linear-gradient(to top, ${rgba(P, 0.7)}, transparent);
          font-size: 0.6rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ═══════ FULL-WIDTH ATMOSPHERE DIVIDER ═══════ */
        #brandbook-content.bb-immersive .bb-atmo-divider {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          margin: 32px 0;
          height: 220px;
          box-shadow: 0 20px 56px ${rgba(P, 0.22)};
        }

        #brandbook-content.bb-immersive .bb-atmo-divider img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.2) contrast(1.05);
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            ${rgba(P, 0.6)} 0%,
            ${rgba(A, 0.3)} 50%,
            transparent 100%
          );
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-pattern {
          position: absolute;
          inset: -50%;
          background-image: var(--bb-pattern-url);
          background-repeat: repeat;
          background-size: 280px 280px;
          opacity: 0.14;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-content {
          position: absolute;
          bottom: 24px; left: 28px;
          z-index: 2;
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-content h3 {
          color: #fff !important;
          font-family: var(--bb-heading-font);
          font-weight: 900;
          font-size: 1.5rem;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
          margin: 0;
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-content h3::after {
          display: none;
        }

        #brandbook-content.bb-immersive .bb-atmo-divider .bb-divider-content p {
          color: rgba(255,255,255,0.7);
          font-size: 0.75rem;
          margin-top: 4px;
        }
      `}</style>
    </>
  );
}
