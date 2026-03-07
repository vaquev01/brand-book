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
  const background = dark
    ? "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.28) 100%)";
  const imageOverlay = dark
    ? "linear-gradient(180deg, rgba(6,8,10,0.06) 0%, rgba(6,8,10,0.56) 42%, rgba(6,8,10,0.86) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(17,17,17,0.44) 40%, rgba(17,17,17,0.78) 100%)";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.85rem] border ${tall ? "min-h-[20rem]" : "min-h-[12.5rem]"}`}
      style={{
        borderColor: dividerColor,
        background,
        boxShadow: dark ? "0 28px 70px rgba(0,0,0,0.24)" : "0 28px 70px rgba(0,0,0,0.12)",
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
          <div className="absolute inset-0" style={{ background: imageOverlay }} />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: dark
              ? `radial-gradient(circle at top right, ${accentHex}66 0%, rgba(255,255,255,0) 44%), linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.18) 100%)`
              : `radial-gradient(circle at top right, ${accentHex}66 0%, rgba(255,255,255,0) 44%), linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.18) 100%)`,
          }}
        />
      )}
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background: card.imageUrl
            ? "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div className="absolute inset-x-5 top-5 h-px" style={{ background: card.imageUrl ? "rgba(255,255,255,0.18)" : dividerColor }} />
      <div className="relative flex h-full flex-col justify-end gap-3 p-5 md:p-6">
        <span
          className="w-fit rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{
            color: card.imageUrl ? "#ffffff" : textColor,
            borderColor: card.imageUrl ? "rgba(255,255,255,0.25)" : dividerColor,
            background: card.imageUrl ? "rgba(255,255,255,0.12)" : dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.26)",
            backdropFilter: "blur(10px)",
          }}
        >
          {card.title}
        </span>
        <p
          className={`max-w-sm font-medium ${tall ? "text-[1.05rem] leading-7" : "text-sm leading-6"}`}
          style={{ color: card.imageUrl ? "rgba(255,255,255,0.94)" : textColor }}
        >
          {card.subtitle}
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-14 rounded-full" style={{ background: accentHex }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ color: card.imageUrl ? "rgba(255,255,255,0.7)" : muted }}
            >
              {card.imageUrl ? "curadoria visual" : "assinatura visual"}
            </span>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: card.imageUrl ? "rgba(255,255,255,0.54)" : muted }}
          >
            {tall ? "hero" : "insight"}
          </span>
        </div>
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
  const editorialDescriptors = [descriptor, firstApplication, personality.slice(0, 2).join(" · ")].filter(Boolean).slice(0, 3);
  const signaturePanels = [
    { label: "Categoria", value: descriptor },
    { label: "Aplicação-chave", value: firstApplication },
    { label: "Expressão", value: personality.slice(0, 2).join(" · ") || data.brandConcept?.toneOfVoice || data.industry },
  ].filter((item) => item.value);

  const allColors = [
    ...(data.colors?.primary ?? []),
    ...(data.colors?.secondary ?? []),
  ].slice(0, 8);

  return (
    <section
      className="page-break mb-16 rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: dark
          ? `linear-gradient(140deg, ${primaryHex} 0%, ${primaryHex}F4 48%, ${accentHex}20 100%)`
          : `linear-gradient(140deg, ${primaryHex} 0%, ${primaryHex}F4 46%, ${accentHex}1E 100%)`,
        minHeight: "92vh",
        fontFamily: `'${primaryFont}', sans-serif`,
      }}
    >
      {/* Top stripe */}
      <div style={{ height: 4, background: accentHex }} />

      <div className="relative flex flex-col justify-between overflow-hidden px-6 py-10 md:px-10 md:py-12 lg:px-16" style={{ minHeight: "calc(92vh - 4px)" }}>
        <div
          aria-hidden="true"
          className="absolute right-[-8rem] top-[-6rem] h-[23rem] w-[23rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${accentHex}36 0%, ${accentHex}00 72%)` }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-8rem] left-[-5rem] h-[20rem] w-[20rem] rounded-full"
          style={{ background: dark ? "radial-gradient(circle, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 72%)" : "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 72%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-10 top-24 h-px"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${dividerColor} 18%, ${dividerColor} 82%, transparent 100%)` }}
        />
        {/* Header row */}
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: subtextColor }}
            >
              Manual de Identidade Visual
            </span>
            {editorialDescriptors[0] && (
              <span
                className="hidden rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] md:inline-flex"
                style={{ color: textColor, borderColor: dividerColor, background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.22)" }}
              >
                {editorialDescriptors[0]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {editorialDescriptors[1] && (
              <span
                className="hidden text-[10px] font-bold uppercase tracking-[0.24em] lg:inline-block"
                style={{ color: subtextColor }}
              >
                {editorialDescriptors[1]}
              </span>
            )}
            <span
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: subtextColor }}
            >
              {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative grid flex-1 grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)] lg:gap-12 xl:gap-14">
          <div className="flex min-h-full flex-col justify-center rounded-[2.25rem] border p-7 md:p-9 lg:p-10 xl:p-12" style={{ borderColor: dividerColor, background: dark ? "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)" : "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.18) 100%)", backdropFilter: "blur(18px)", boxShadow: dark ? "0 30px 90px rgba(0,0,0,0.18)" : "0 30px 90px rgba(0,0,0,0.08)" }}>
            {/* Brand name */}
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span
                className="rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{
                  color: textColor,
                  borderColor: dividerColor,
                  background: dark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.34)",
                }}
              >
                resumo visual da identidade
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: subtextColor }}>
                {descriptor}
              </span>
            </div>
            <h1
              className="mb-5 font-black leading-[0.94]"
              style={{
                color: textColor,
                fontSize: "clamp(3.15rem, 7vw, 6.8rem)",
                letterSpacing: "-0.045em",
                fontFamily: `'${primaryFont}', sans-serif`,
                textWrap: "balance",
              }}
            >
              {data.brandName}
            </h1>

            {/* Industry */}
            <p
              className="mb-6 text-sm font-bold uppercase tracking-[0.3em]"
              style={{ color: subtextColor }}
            >
              {data.industry}
            </p>

            {/* Tagline */}
            {tagline && (
              <p
                className="mb-5 max-w-2xl text-[1.3rem] font-medium leading-[1.55] md:text-[1.45rem]"
                style={{ color: textColor, opacity: 0.92, textWrap: "balance" }}
              >
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            {summaryLine && (
              <p className="mb-8 max-w-[40rem] text-[15px] leading-7 md:text-[1.02rem]" style={{ color: dark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.72)", fontFamily: `'${secondaryFont}', sans-serif` }}>
                {summaryLine}
              </p>
            )}

            {signaturePanels.length > 0 && (
              <div className="mb-8 grid gap-3 md:grid-cols-3">
                {signaturePanels.map((panel) => (
                  <div
                    key={panel.label}
                    className="rounded-[1.35rem] border px-4 py-4"
                    style={{
                      borderColor: dividerColor,
                      background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.22)",
                    }}
                  >
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: subtextColor }}>
                      {panel.label}
                    </div>
                    <div className="text-sm font-semibold leading-6" style={{ color: textColor }}>
                      {panel.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Personality tags */}
            {personality.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2.5">
                {personality.slice(0, 5).map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border px-3.5 py-1.5 text-xs font-semibold"
                    style={{
                      color: textColor,
                      borderColor: dividerColor,
                      background: dark ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="mb-8 flex items-center gap-4">
              <div style={{ width: "4rem", height: 2, background: accentHex }} />
              {editorialDescriptors[2] && (
                <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: subtextColor }}>
                  {editorialDescriptors[2]}
                </span>
              )}
            </div>

            {/* Core values */}
            {data.brandConcept?.values?.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.brandConcept.values.slice(0, 3).map((v, index) => (
                  <div
                    key={v}
                    className="rounded-[1.35rem] border p-4"
                    style={{ color: textColor, borderColor: dividerColor, background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.14)" }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: subtextColor }}>
                        Valor
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: subtextColor }}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="text-sm font-semibold leading-6">{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-4 lg:grid-rows-[minmax(19rem,1fr)_auto] xl:gap-5">
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
          <div className="mb-6 border-t" style={{ borderColor: dividerColor }} />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center flex-wrap">
                {allColors.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-full shadow-md"
                    style={{ width: 30, height: 30, background: c.hex, border: `2px solid ${dividerColor}` }}
                    title={`${c.name} — ${c.hex}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="rounded-[1.25rem] border px-4 py-3" style={{ borderColor: dividerColor, background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.2)" }}>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: subtextColor }}>
                    Tipografia
                  </div>
                  <div className="text-sm font-semibold" style={{ color: textColor }}>
                    {primaryFont}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border px-4 py-3" style={{ borderColor: dividerColor, background: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.2)" }}>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: subtextColor }}>
                    Aplicação-chave
                  </div>
                  <div className="text-sm font-semibold" style={{ color: textColor }}>
                    {firstApplication}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 self-start lg:self-end">
              <div className="hidden h-px w-16 lg:block" style={{ background: dividerColor }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: subtextColor }}
              >
                {data.brandName} &copy; Brand Identity
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
