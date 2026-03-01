"use client";
import { BrandbookData, Typography } from "@/lib/types";

function TypoCard({ title, typo }: { title: string; typo: Typography }) {
  return (
    <div className="bg-gray-50 p-8 rounded-lg border">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-4xl font-bold mb-4" style={{ fontFamily: `'${typo.name}', sans-serif` }}>
        {typo.name}
      </div>
      <div className="text-gray-400 text-sm mb-4">Aa Bb Cc 0123456789 !@#</div>
      <div className="mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase">Uso: </span>
        <span className="text-sm">{typo.usage}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {typo.weights.map((w, i) => (
          <span key={i} className="bg-gray-200 text-xs px-2 py-1 rounded">{w}</span>
        ))}
      </div>
    </div>
  );
}

export function SectionTypography({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.typography.marketing;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Tipografia</h2>
      <div className={`grid grid-cols-1 ${isAdvanced ? "md:grid-cols-3" : "md:grid-cols-2"} gap-8`}>
        {isAdvanced ? (
          <>
            <TypoCard title="Marketing & Display" typo={data.typography.marketing!} />
            <TypoCard title="UI & Alta Legibilidade" typo={data.typography.ui!} />
            <TypoCard title="Dados & Monospace" typo={data.typography.monospace!} />
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
