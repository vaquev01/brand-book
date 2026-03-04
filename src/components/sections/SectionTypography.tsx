"use client";
import { BrandbookData, Typography } from "@/lib/types";

function TypoCard({ title, typo }: { title: string; typo: Typography }) {
  return (
    <div className="bg-gray-50 p-5 rounded-lg border">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-1" style={{ fontFamily: `'${typo.name}', sans-serif` }}>
        {typo.name}
      </div>
      {typo.category && (
        <span className="inline-block text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded mb-3">{typo.category}</span>
      )}
      <div className="text-gray-400 text-sm mb-3">Aa Bb Cc 0123456789 !@#</div>
      <div className="mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase">Uso: </span>
        <span className="text-sm">{typo.usage}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {typo.weights.map((w, i) => (
          <span key={i} className="bg-gray-200 text-xs px-2 py-1 rounded">{w}</span>
        ))}
      </div>
      {(typo.fallbackFont || typo.textTransform) && (
        <div className="border-t pt-3 space-y-1">
          {typo.fallbackFont && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Alternativa Google Fonts:</span> {typo.fallbackFont}
            </div>
          )}
          {typo.textTransform && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Transformação:</span> {typo.textTransform}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionTypography({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.typography.marketing;
  const advancedTypos: Array<{ title: string; typo: Typography }> = [];
  if (data.typography.marketing) advancedTypos.push({ title: "Marketing & Display", typo: data.typography.marketing });
  if (data.typography.ui) advancedTypos.push({ title: "UI & Alta Legibilidade", typo: data.typography.ui });
  if (data.typography.monospace) advancedTypos.push({ title: "Dados & Monospace", typo: data.typography.monospace });

  const advancedCols = advancedTypos.length >= 3 ? "md:grid-cols-3" : advancedTypos.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Tipografia
      </h2>
      <div className={`grid grid-cols-1 ${isAdvanced ? advancedCols : "md:grid-cols-2"} gap-5`}>
        {isAdvanced ? (
          <>
            {advancedTypos.map(({ title, typo }) => (
              <TypoCard key={title} title={title} typo={typo} />
            ))}
          </>
        ) : (
          <>
            {data.typography.primary && <TypoCard title="Fonte Primária" typo={data.typography.primary} />}
            {data.typography.secondary && <TypoCard title="Fonte Secundária" typo={data.typography.secondary} />}
          </>
        )}
      </div>
    </section>
  );
}
