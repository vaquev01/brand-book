"use client";
import { BrandbookData } from "@/lib/types";

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

export function SectionCover({ data }: { data: BrandbookData }) {
  const primaryHex = data.colors?.primary?.[0]?.hex ?? "#111111";
  const accentHex = data.colors?.primary?.[1]?.hex ?? data.colors?.secondary?.[0]?.hex ?? "#e5e5e5";
  const dark = isDark(primaryHex);
  const textColor = dark ? "#ffffff" : "#111111";
  const subtextColor = dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const dividerColor = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";

  const tagline = data.verbalIdentity?.tagline ?? data.positioning?.positioningStatement ?? "";
  const personality = data.brandConcept?.personality ?? [];
  const primaryFont = data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "inherit";

  const allColors = [
    ...(data.colors?.primary ?? []),
    ...(data.colors?.secondary ?? []),
  ].slice(0, 8);

  return (
    <section
      className="page-break mb-16 rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: primaryHex, minHeight: "88vh", fontFamily: `'${primaryFont}', sans-serif` }}
    >
      {/* Top stripe */}
      <div style={{ height: 4, background: accentHex }} />

      <div className="flex flex-col justify-between" style={{ minHeight: "calc(88vh - 4px)", padding: "3rem 4rem" }}>
        {/* Header row */}
        <div className="flex items-center justify-between">
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
        <div className="flex-1 flex flex-col justify-center py-12">
          {/* Brand name */}
          <h1
            className="font-black leading-none mb-4"
            style={{
              color: textColor,
              fontSize: "clamp(3rem, 8vw, 7rem)",
              letterSpacing: "-0.02em",
              fontFamily: `'${primaryFont}', sans-serif`,
            }}
          >
            {data.brandName}
          </h1>

          {/* Industry */}
          <p
            className="text-sm font-bold uppercase tracking-[0.3em] mb-8"
            style={{ color: subtextColor }}
          >
            {data.industry}
          </p>

          {/* Tagline */}
          {tagline && (
            <p
              className="text-xl font-medium leading-relaxed max-w-2xl mb-10"
              style={{ color: textColor, opacity: 0.85 }}
            >
              &ldquo;{tagline}&rdquo;
            </p>
          )}

          {/* Personality tags */}
          {personality.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {personality.slice(0, 5).map((trait) => (
                <span
                  key={trait}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{
                    color: textColor,
                    borderColor: dividerColor,
                    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ width: "4rem", height: 2, background: accentHex, marginBottom: "2.5rem" }} />

          {/* Core values */}
          {data.brandConcept?.values?.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {data.brandConcept.values.slice(0, 4).map((v) => (
                <div key={v} style={{ color: textColor }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: subtextColor }}>
                    Valor
                  </div>
                  <div className="text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row — color palette */}
        <div>
          <div
            className="border-t mb-5"
            style={{ borderColor: dividerColor }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {allColors.map((c, i) => (
                <div
                  key={i}
                  className="rounded-full shadow-md"
                  style={{ width: 28, height: 28, background: c.hex, border: `2px solid ${dividerColor}` }}
                  title={`${c.name} — ${c.hex}`}
                />
              ))}
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
