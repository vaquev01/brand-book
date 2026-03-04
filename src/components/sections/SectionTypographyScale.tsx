"use client";
import { BrandbookData } from "@/lib/types";

export function SectionTypographyScale({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.typographyScale || data.typographyScale.length === 0) return null;

  const fontMap: Record<string, string | undefined> = {
    marketing: data.typography.marketing?.name,
    ui: data.typography.ui?.name,
    monospace: data.typography.monospace?.name,
    primary: data.typography.primary?.name,
    secondary: data.typography.secondary?.name,
  };

  return (
    <section className="page-break mb-10">
      <h2 className="text-2xl font-bold mb-5 border-b pb-3">{String(num).padStart(2, "0")}. Escala Tipográfica</h2>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-bold">Styles</h3>
          <p className="text-xs text-gray-500 mt-1">Tamanhos, line-height, peso e uso recomendado</p>
        </div>

        <div className="divide-y">
          {data.typographyScale.map((t, i) => (
            <div key={i} className="px-5 py-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.name}</div>
                <div className="text-sm text-gray-600 mt-1">Role: <span className="font-mono">{t.fontRole}</span></div>
                <div className="text-sm text-gray-600">{t.size} · {t.lineHeight} · {t.fontWeight}{t.letterSpacing ? ` · ${t.letterSpacing}` : ""}</div>
              </div>
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Uso</div>
                <p className="text-sm text-gray-700">{t.usage}</p>
              </div>
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Preview</div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div
                    className="text-gray-900"
                    style={{
                      fontFamily: fontMap[t.fontRole] ? `'${fontMap[t.fontRole]}', ${t.fontRole === "monospace" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "sans-serif"}` : undefined,
                      fontSize: t.size,
                      lineHeight: t.lineHeight,
                      fontWeight: /^\d+$/.test(t.fontWeight) ? Number(t.fontWeight) : t.fontWeight,
                      letterSpacing: t.letterSpacing,
                    }}
                  >
                    {data.brandName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
