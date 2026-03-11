"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

function isLight(hex: string): boolean {
  if (!hex || hex.length < 4) return true;
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.55;
}

export function SectionBrandWorld({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const allColors = [...data.colors.primary, ...data.colors.secondary];
  const marketing = data.typography.marketing ?? data.typography.primary;
  const ui = data.typography.ui ?? data.typography.secondary;
  const values = data.brandConcept.values ?? [];
  const personality = data.brandConcept.personality ?? [];
  const moodKeywords = data.imageGenerationBriefing?.moodKeywords ?? [];
  const tagline = data.verbalIdentity?.tagline;
  const archetype = data.brandConcept.brandArchetype;

  const primaryHex = data.colors.primary[0]?.hex ?? "#0a0a0a";
  const accentHex = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#c0a060";
  const onPrimary = isLight(primaryHex) ? "rgba(0,0,0,0.88)" : "#fff";
  const onPrimaryMuted = isLight(primaryHex) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Mundo da Marca
      </h2>

      {/* Color Universe strip */}
      {allColors.length > 0 && (
        <div className="flex rounded-[1.4rem] overflow-hidden mb-5 shadow-md" style={{ height: 96 }}>
          {allColors.map((c, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end pb-2 px-2"
              style={{ backgroundColor: c.hex }}
              title={`${c.name} — ${c.hex}`}
            >
              <p
                className="text-[8px] font-bold uppercase tracking-wider truncate leading-none"
                style={{ color: isLight(c.hex) ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)" }}
              >
                {c.name.split(" ")[0]}
              </p>
              <p
                className="text-[9px] font-mono leading-tight mt-0.5"
                style={{ color: isLight(c.hex) ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.7)" }}
              >
                {c.hex}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Typography Universe — dark hero panel */}
      <div
        className="rounded-[1.4rem] overflow-hidden mb-5 shadow-lg relative"
        style={{ background: primaryHex }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accentHex }} />
        <div className="relative px-7 py-10 md:px-10 md:py-14">
          {/* Brand name */}
          {marketing && (
            <div
              className="leading-none break-words mb-3"
              style={{
                fontFamily: `'${marketing.name}', sans-serif`,
                fontSize: "clamp(2.8rem, 10vw, 5.5rem)",
                fontWeight: 900,
                color: onPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              <EditableField
                value={data.brandName}
                onSave={(val) => onUpdateData?.((prev) => ({ ...prev, brandName: val }))}
                readOnly={!onUpdateData}
              />
            </div>
          )}

          {/* Tagline */}
          {(tagline || onUpdateData) && (
            <div
              className="mb-5 italic font-medium"
              style={{
                fontFamily: marketing ? `'${marketing.name}', sans-serif` : "inherit",
                fontSize: "clamp(1rem, 3vw, 1.35rem)",
                color: accentHex,
              }}
            >
              &ldquo;
              <EditableField
                value={tagline || ""}
                onSave={(val) => onUpdateData?.((prev) => ({
                  ...prev,
                  verbalIdentity: prev.verbalIdentity ? { ...prev.verbalIdentity, tagline: val } : undefined,
                }))}
                readOnly={!onUpdateData}
                className="inline"
              />
              &rdquo;
            </div>
          )}

          {/* Purpose / mission in UI font */}
          {ui && (data.brandConcept.purpose || data.brandConcept.mission || onUpdateData) && (
            <div
              className="leading-relaxed max-w-2xl mb-6"
              style={{
                fontFamily: `'${ui.name}', sans-serif`,
                fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
                color: onPrimaryMuted,
              }}
            >
              <EditableField
                value={data.brandConcept.purpose || data.brandConcept.mission || ""}
                onSave={(val) => onUpdateData?.((prev) => ({
                  ...prev,
                  brandConcept: { ...prev.brandConcept, purpose: val },
                }))}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}

          {/* Archetype + personality */}
          <div className="flex flex-wrap gap-2 items-center">
            {(archetype || onUpdateData) && (
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ background: accentHex, color: isLight(accentHex) ? "#000" : "#fff" }}
              >
                <EditableField
                  value={archetype || ""}
                  onSave={(val) => onUpdateData?.((prev) => ({
                    ...prev,
                    brandConcept: { ...prev.brandConcept, brandArchetype: val || undefined },
                  }))}
                  readOnly={!onUpdateData}
                />
              </span>
            )}
            {personality.map((p, i) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
                style={{ borderColor: `${accentHex}77`, color: accentHex }}
              >
                <EditableField
                  value={p}
                  onSave={(val) => onUpdateData?.((prev) => ({
                    ...prev,
                    brandConcept: {
                      ...prev.brandConcept,
                      personality: (prev.brandConcept.personality ?? []).map((item, idx) => idx === i ? val : item),
                    },
                  }))}
                  onDelete={onUpdateData ? () => onUpdateData((prev) => ({
                    ...prev,
                    brandConcept: {
                      ...prev.brandConcept,
                      personality: (prev.brandConcept.personality ?? []).filter((_, idx) => idx !== i),
                    },
                  })) : undefined}
                  readOnly={!onUpdateData}
                />
              </span>
            ))}
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData((prev) => ({
                  ...prev,
                  brandConcept: {
                    ...prev.brandConcept,
                    personality: [...(prev.brandConcept.personality ?? []), "Nova trait"],
                  },
                }))}
                className="no-print text-[10px] font-bold text-gray-400 border border-dashed border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-50 transition"
              >
                + Trait
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Values grid */}
      {(values.length > 0 || onUpdateData) && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Valores da Marca</p>
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData((prev) => ({
                  ...prev,
                  brandConcept: {
                    ...prev.brandConcept,
                    values: [...(prev.brandConcept.values ?? []), "Novo valor"],
                  },
                }))}
                className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {values.map((v, i) => (
              <div
                key={i}
                className="rounded-[1rem] border px-4 py-3"
                style={{ borderColor: `${accentHex}44`, background: `${primaryHex}0a` }}
              >
                <div
                  className="text-sm font-extrabold tracking-tight"
                  style={{
                    color: primaryHex,
                    fontFamily: marketing ? `'${marketing.name}', sans-serif` : "inherit",
                  }}
                >
                  <EditableField
                    value={v}
                    onSave={(val) => onUpdateData?.((prev) => ({
                      ...prev,
                      brandConcept: {
                        ...prev.brandConcept,
                        values: (prev.brandConcept.values ?? []).map((item, idx) => idx === i ? val : item),
                      },
                    }))}
                    onDelete={onUpdateData ? () => onUpdateData((prev) => ({
                      ...prev,
                      brandConcept: {
                        ...prev.brandConcept,
                        values: (prev.brandConcept.values ?? []).filter((_, idx) => idx !== i),
                      },
                    })) : undefined}
                    readOnly={!onUpdateData}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood keywords energy cloud */}
      {(moodKeywords.length > 0 || onUpdateData) && (
        <div className="rounded-[1.4rem] border bg-gray-50 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Energia Visual</p>
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData((prev) => ({
                  ...prev,
                  imageGenerationBriefing: {
                    ...(prev.imageGenerationBriefing as BrandbookData["imageGenerationBriefing"]),
                    moodKeywords: [...(prev.imageGenerationBriefing?.moodKeywords ?? []), "nova keyword"],
                  } as BrandbookData["imageGenerationBriefing"],
                }))}
                className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {moodKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-white border shadow-sm text-gray-700"
              >
                <EditableField
                  value={kw}
                  onSave={(val) => onUpdateData?.((prev) => ({
                    ...prev,
                    imageGenerationBriefing: {
                      ...(prev.imageGenerationBriefing as BrandbookData["imageGenerationBriefing"]),
                      moodKeywords: (prev.imageGenerationBriefing?.moodKeywords ?? []).map((item, idx) => idx === i ? val : item),
                    } as BrandbookData["imageGenerationBriefing"],
                  }))}
                  onDelete={onUpdateData ? () => onUpdateData((prev) => ({
                    ...prev,
                    imageGenerationBriefing: {
                      ...(prev.imageGenerationBriefing as BrandbookData["imageGenerationBriefing"]),
                      moodKeywords: (prev.imageGenerationBriefing?.moodKeywords ?? []).filter((_, idx) => idx !== i),
                    } as BrandbookData["imageGenerationBriefing"],
                  })) : undefined}
                  readOnly={!onUpdateData}
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
