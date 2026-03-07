"use client";
import { BrandbookData } from "@/lib/types";
import type { CoverVisualCard, CoverVisualSummary } from "@/components/brandbookViewerAssetSelectors";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
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

function isDark(hex: string): boolean {
  return luminance(hex) < 0.35;
}

function VisualCard({
  accentHex,
  card,
  dark,
  dividerColor,
  muted,
  textColor,
  tall = false,
}: {
  accentHex: string;
  card: CoverVisualCard;
  dark: boolean;
  dividerColor: string;
  muted: string;
  textColor: string;
  tall?: boolean;
}) {
  const background = dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.38)";
  const imageOverlay = dark
    ? "linear-gradient(180deg, rgba(6,8,10,0.02) 0%, rgba(6,8,10,0.78) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(17,17,17,0.68) 100%)";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border ${tall ? "min-h-[18rem]" : "min-h-[11rem]"}`}
      style={{
        borderColor: dividerColor,
        background,
        boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.22)" : "0 24px 60px rgba(0,0,0,0.10)",
      }}
    >
      {card.imageUrl ? (
        <>
          <div
            aria-label={card.title}
            role="img"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${JSON.stringify(card.imageUrl)})` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: imageOverlay }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: dark
              ? `radial-gradient(circle at top right, ${accentHex}55 0%, rgba(255,255,255,0) 44%), linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)`
              : `radial-gradient(circle at top right, ${accentHex}66 0%, rgba(255,255,255,0) 44%), linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.18) 100%)`,
          }}
        />
      )}
      <div className="relative flex h-full flex-col justify-end gap-2 p-5">
        <span
          className="w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{
            color: card.imageUrl ? "#ffffff" : textColor,
            borderColor: card.imageUrl ? "rgba(255,255,255,0.25)" : dividerColor,
            background: card.imageUrl ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.18)",
          }}
        >
          {card.title}
        </span>
        <p
          className={`max-w-sm ${tall ? "text-base leading-6" : "text-sm leading-5"}`}
          style={{ color: card.imageUrl ? "rgba(255,255,255,0.94)" : textColor }}
        >
          {card.subtitle}
        </p>
        {!card.imageUrl && (
          <div className="mt-1 h-1.5 w-14 rounded-full" style={{ background: accentHex }} />
        )}
        {card.imageUrl && (
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.68)" }}>
            resumo visual da marca
          </span>
        )}
        {!card.imageUrl && (
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
            código prioritário
          </span>
        )}
      </div>
    </div>
  );
}

export function SectionCover({ data, visualSummary }: { data: BrandbookData; visualSummary?: CoverVisualSummary }) {
  const primaryHex = data.colors?.primary?.[0]?.hex ?? "#111111";
  const accentHex = data.colors?.primary?.[1]?.hex ?? data.colors?.secondary?.[0]?.hex ?? "#e5e5e5";
  const dark = isDark(primaryHex);
  const textColor = dark ? "#ffffff" : "#111111";
  const subtextColor = dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const dividerColor = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

  const tagline = data.verbalIdentity?.tagline ?? data.positioning?.positioningStatement ?? "";
  const personality = data.brandConcept?.personality ?? [];
  const primaryFont = data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "inherit";
  const secondaryFont = data.typography?.ui?.name ?? data.typography?.secondary?.name ?? primaryFont;
  const descriptor = data.positioning?.category ?? data.industry;
  const summaryLine = data.verbalIdentity?.oneLiner ?? data.positioning?.positioningStatement ?? data.brandConcept?.mission ?? "";
  const firstApplication = data.applications?.[0]?.type ?? data.keyVisual?.patterns?.[0] ?? data.keyVisual?.elements?.[0] ?? data.industry;
  const heroCard = visualSummary?.hero ?? null;
  const supportCards = (visualSummary?.cards ?? []).slice(0, 3);

  const allColors = [
    ...(data.colors?.primary ?? []),
    ...(data.colors?.secondary ?? []),
  ].slice(0, 8);

  return (
    <section
      className="page-break mb-16 rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: dark
          ? `linear-gradient(135deg, ${primaryHex} 0%, ${primaryHex}F0 54%, ${accentHex}22 100%)`
          : `linear-gradient(135deg, ${primaryHex} 0%, ${primaryHex}F4 52%, ${accentHex}1A 100%)`,
        minHeight: "88vh",
        fontFamily: `'${primaryFont}', sans-serif`,
      }}
    >
      {/* Top stripe */}
      <div style={{ height: 4, background: accentHex }} />

      <div className="relative flex flex-col justify-between overflow-hidden px-6 py-10 md:px-10 md:py-12 lg:px-16" style={{ minHeight: "calc(88vh - 4px)" }}>
        <div
          aria-hidden="true"
          className="absolute right-[-6rem] top-[-5rem] h-[19rem] w-[19rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${accentHex}2f 0%, ${accentHex}00 70%)` }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-8rem] left-[-5rem] h-[18rem] w-[18rem] rounded-full"
          style={{ background: dark ? "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 72%)" : "radial-gradient(circle, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 72%)" }}
        />
        {/* Header row */}
        <div className="relative flex items-center justify-between gap-4">
          <span
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: subtextColor }}
          >
            Manual de Identidade Visual
          </span>
          <span
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: subtextColor }}
          >
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Main content */}
        <div className="relative grid flex-1 grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:gap-12">
          <div className="flex min-h-full flex-col justify-center rounded-[2rem] border p-7 md:p-9 lg:p-10" style={{ borderColor: dividerColor, background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.24)" }}>
            {/* Brand name */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{
                  color: textColor,
                  borderColor: dividerColor,
                  background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.34)",
                }}
              >
                resumo visual da identidade
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: subtextColor }}>
                {descriptor}
              </span>
            </div>
            <h1
              className="font-black leading-none mb-4"
              style={{
                color: textColor,
                fontSize: "clamp(2.8rem, 7vw, 6.4rem)",
                letterSpacing: "-0.03em",
                fontFamily: `'${primaryFont}', sans-serif`,
              }}
            >
              {data.brandName}
            </h1>

            {/* Industry */}
            <p
              className="text-sm font-bold uppercase tracking-[0.3em] mb-6"
              style={{ color: subtextColor }}
            >
              {data.industry}
            </p>

            {/* Tagline */}
            {tagline && (
              <p
                className="text-xl font-medium leading-relaxed max-w-2xl mb-5"
                style={{ color: textColor, opacity: 0.88 }}
              >
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            {summaryLine && (
              <p className="mb-8 max-w-2xl text-sm leading-6 md:text-[15px]" style={{ color: dark ? "rgba(255,255,255,0.76)" : "rgba(0,0,0,0.72)", fontFamily: `'${secondaryFont}', sans-serif` }}>
                {summaryLine}
              </p>
            )}

            {/* Personality tags */}
            {personality.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {personality.slice(0, 5).map((trait) => (
                  <span
                    key={trait}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{
                      color: textColor,
                      borderColor: dividerColor,
                      background: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ width: "4rem", height: 2, background: accentHex, marginBottom: "2rem" }} />

            {/* Core values */}
            {data.brandConcept?.values?.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.brandConcept.values.slice(0, 3).map((v) => (
                  <div key={v} style={{ color: textColor }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] mb-1" style={{ color: subtextColor }}>
                      Valor
                    </div>
                    <div className="text-sm font-semibold leading-5">{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-4 lg:grid-rows-[minmax(17rem,1fr)_auto]">
            {heroCard && (
              <VisualCard
                accentHex={accentHex}
                card={heroCard}
                dark={dark}
                dividerColor={dividerColor}
                muted={subtextColor}
                tall
                textColor={textColor}
              />
            )}
            {supportCards.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:[grid-template-columns:repeat(1,minmax(0,1fr))] xl:[grid-template-columns:repeat(3,minmax(0,1fr))]">
                {supportCards.map((card) => (
                  <VisualCard
                    key={card.id}
                    accentHex={accentHex}
                    card={card}
                    dark={dark}
                    dividerColor={dividerColor}
                    muted={subtextColor}
                    textColor={textColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row — color palette */}
        <div className="relative">
          <div
            className="border-t mb-5"
            style={{ borderColor: dividerColor }}
          />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center flex-wrap">
                {allColors.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-full shadow-md"
                    style={{ width: 28, height: 28, background: c.hex, border: `2px solid ${dividerColor}` }}
                    title={`${c.name} — ${c.hex}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: subtextColor }}>
                    Tipografia
                  </div>
                  <div className="text-sm font-semibold" style={{ color: textColor }}>
                    {primaryFont}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: subtextColor }}>
                    Aplicação-chave
                  </div>
                  <div className="text-sm font-semibold" style={{ color: textColor }}>
                    {firstApplication}
                  </div>
                </div>
              </div>
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: subtextColor }}
            >
              {data.brandName} © Brand Identity
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
