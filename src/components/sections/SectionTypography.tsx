"use client";
import { BrandbookData, Typography } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

const WEIGHT_VALUES: Record<string, number> = {
  Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500,
  SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900,
  "100": 100, "200": 200, "300": 300, "400": 400, "500": 500,
  "600": 600, "700": 700, "800": 800, "900": 900,
};

function resolveWeight(w: string): number {
  return WEIGHT_VALUES[w] ?? (isNaN(Number(w)) ? 400 : Number(w));
}

const SPECIMEN_PANGRAM = "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj 0123456789";
const SPECIMEN_SENTENCE = "A marca existe para ser lembrada.";

function WeightShowcase({ typo, name }: { typo: Typography; name: string }) {
  if (!typo.weights || typo.weights.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pesos disponíveis</p>
      <div className="flex flex-wrap gap-1.5">
        {typo.weights.map((w, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5"
          >
            <span className="text-[10px] font-mono text-gray-400">{w}</span>
            <span
              className="text-gray-900 text-sm leading-none"
              style={{ fontFamily: `'${name}', sans-serif`, fontWeight: resolveWeight(w) }}
            >
              Abc
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TypoCard({ title, typo, typoKey, onUpdateData }: { title: string; typo: Typography; typoKey: string; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const displayWeight = typo.weights?.find(w => /bold|black|700|800|900/i.test(w)) ?? typo.weights?.[0] ?? "700";
  const bodyWeight = typo.weights?.find(w => /regular|medium|400|500/i.test(w)) ?? typo.weights?.[0] ?? "400";

  return (
    <div className="bg-white rounded-[1.4rem] border overflow-hidden shadow-sm group/typo">
      {/* Specimen hero */}
      <div className="bg-gray-950 px-6 pt-5 pb-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 28px)`,
        }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-2">{title}</p>
        <div
          className="text-white leading-[1.0] break-words"
          style={{
            fontFamily: `'${typo.name}', sans-serif`,
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: resolveWeight(displayWeight),
            textTransform: typo.textTransform as React.CSSProperties["textTransform"] || "none",
          }}
        >
          {typo.name}
        </div>
      </div>

      {/* Alphabet specimen */}
      <div className="px-5 py-3 bg-gray-50 border-b">
        <span
          className="text-gray-500 text-sm tracking-wide"
          style={{ fontFamily: `'${typo.name}', sans-serif` }}
        >
          {SPECIMEN_PANGRAM}
        </span>
      </div>

      {/* Metadata */}
      <div className="p-3">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1">
            <div className="text-[1.55rem] font-bold leading-tight mb-0.5" style={{ fontFamily: `'${typo.name}', sans-serif` }}>
              <EditableField
                value={typo.name}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], name: val } } }))}
                readOnly={!onUpdateData}
              />
            </div>
            {typo.category && (
              <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                <EditableField
                  value={typo.category}
                  onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], category: val } } }))}
                  readOnly={!onUpdateData}
                />
              </span>
            )}
          </div>
        </div>

        <div className="mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Uso: </span>
          <span className="text-sm leading-6 text-gray-700">
            <EditableField
              value={typo.usage}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], usage: val } } }))}
              readOnly={!onUpdateData}
              multiline
            />
          </span>
        </div>

        {/* Weights */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {typo.weights.map((w, i) => (
            <span key={i} className="bg-gray-100 text-xs px-2.5 py-1 rounded-full font-mono flex items-stretch overflow-hidden group/item">
              <EditableField
                value={w}
                onSave={(val) => onUpdateData?.(prev => {
                  const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
                  const nextWeights = [...currentTypo.weights];
                  nextWeights[i] = val;
                  return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: nextWeights } } };
                })}
                readOnly={!onUpdateData}
              />
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
                    return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: currentTypo.weights.filter((_, idx) => idx !== i) } } };
                  })}
                  className="no-print ml-1 -mr-1 pl-1 border-l border-gray-300 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {onUpdateData && (
            <button
              onClick={() => onUpdateData(prev => {
                const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
                return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: [...currentTypo.weights, "Novo Peso"] } } };
              })}
              className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition"
            >
              + Peso
            </button>
          )}
        </div>

        {(typo.fallbackFont || typo.textTransform) && (
          <div className="border-t pt-2 space-y-1">
            {typo.fallbackFont && (
              <div className="text-xs text-gray-600 flex gap-1">
                <span className="font-semibold text-gray-500 shrink-0">Google Fonts:</span>
                <EditableField
                  value={typo.fallbackFont}
                  onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], fallbackFont: val } } }))}
                  readOnly={!onUpdateData}
                  className="flex-1 text-gray-500"
                />
              </div>
            )}
            {typo.textTransform && (
              <div className="text-xs text-gray-600 flex gap-1">
                <span className="font-semibold text-gray-500 shrink-0">Transform:</span>
                <EditableField
                  value={typo.textTransform}
                  onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], textTransform: val } } }))}
                  readOnly={!onUpdateData}
                  className="flex-1 text-gray-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Weight showcase */}
        <WeightShowcase typo={typo} name={typo.name} />
      </div>
    </div>
  );
}

function FontPairingPreview({ data }: { data: BrandbookData }) {
  const marketing = data.typography.marketing || data.typography.primary;
  const ui = data.typography.ui || data.typography.secondary;
  if (!marketing || !ui || marketing.name === ui.name) return null;

  const headingWeight = marketing.weights?.find(w => /bold|black|700|800|900/i.test(w)) ?? "700";
  const bodyWeight = ui.weights?.find(w => /regular|medium|400|500/i.test(w)) ?? "400";

  return (
    <div className="mt-6 rounded-[1.4rem] border overflow-hidden shadow-sm">
      <div className="px-5 py-3 bg-gray-50 border-b">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Combinação Tipográfica</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Como as fontes funcionam juntas num layout real</p>
      </div>
      <div className="p-4 bg-white space-y-2">
        <div
          className="text-xl font-bold leading-tight text-gray-950"
          style={{ fontFamily: `'${marketing.name}', sans-serif`, fontWeight: resolveWeight(headingWeight) }}
        >
          {data.brandName}
        </div>
        <div
          className="text-sm leading-6 text-gray-600 max-w-xl"
          style={{ fontFamily: `'${ui.name}', sans-serif`, fontWeight: resolveWeight(bodyWeight) }}
        >
          {data.brandConcept?.purpose || data.brandConcept?.mission || "A marca que conecta pessoas e constrói experiências memoráveis a cada encontro."}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-gray-400">{marketing.name} — headline</span>
          <span className="text-gray-200">|</span>
          <span className="text-[11px] font-mono text-gray-400">{ui.name} — body</span>
        </div>
      </div>
    </div>
  );
}

export function SectionTypography({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const isAdvanced = !!data.typography.marketing;
  const advancedTypos: Array<{ title: string; typo: Typography; key: string }> = [];
  if (data.typography.marketing) advancedTypos.push({ title: "Marketing & Display", typo: data.typography.marketing, key: "marketing" });
  if (data.typography.ui) advancedTypos.push({ title: "UI & Alta Legibilidade", typo: data.typography.ui, key: "ui" });
  if (data.typography.monospace) advancedTypos.push({ title: "Dados & Monospace", typo: data.typography.monospace, key: "monospace" });

  const advancedCols = advancedTypos.length >= 3 ? "md:grid-cols-2 2xl:grid-cols-3" : advancedTypos.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Tipografia
      </h2>
      <div className={`grid grid-cols-1 ${isAdvanced ? advancedCols : "md:grid-cols-2"} gap-5`}>
        {isAdvanced ? (
          advancedTypos.map(({ title, typo, key }) => (
            <TypoCard key={title} title={title} typo={typo} typoKey={key} onUpdateData={onUpdateData} />
          ))
        ) : (
          <>
            {data.typography.primary && <TypoCard title="Fonte Primária" typo={data.typography.primary} typoKey="primary" onUpdateData={onUpdateData} />}
            {data.typography.secondary && <TypoCard title="Fonte Secundária" typo={data.typography.secondary} typoKey="secondary" onUpdateData={onUpdateData} />}
          </>
        )}
      </div>
      <FontPairingPreview data={data} />
    </section>
  );
}
