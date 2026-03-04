"use client";
import { BrandbookData, Color } from "@/lib/types";

function ColorSwatch({ color }: { color: Color }) {
  return (
    <div className="color-swatch bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-20 w-full" style={{ backgroundColor: color.hex }} />
      <div className="p-3">
        <h4 className="font-bold text-xs mb-1 truncate" title={color.name}>{color.name}</h4>
        <div className="text-[10px] text-gray-500 space-y-0.5 font-mono">
          <p><span className="font-semibold text-gray-700">HEX:</span> {color.hex}</p>
          <p><span className="font-semibold text-gray-700">RGB:</span> {color.rgb}</p>
          <p><span className="font-semibold text-gray-700">CMYK:</span> {color.cmyk}</p>
          {color.pantone && (
            <p><span className="font-semibold text-gray-700">Pantone:</span> {color.pantone}</p>
          )}
        </div>
        {color.usage && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-[10px] text-gray-600 leading-relaxed"><span className="font-semibold text-gray-700">Uso:</span> {color.usage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionColors({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.colors.semantic;

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Paleta de Cores
      </h2>

      <h3 className="text-base font-semibold mb-3 border-l-4 border-gray-800 pl-3">Cores Primárias</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {data.colors.primary.map((c, i) => <ColorSwatch key={i} color={c} />)}
      </div>

      <h3 className="text-base font-semibold mb-3 border-l-4 border-gray-400 pl-3">Cores Secundárias</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {data.colors.secondary.map((c, i) => <ColorSwatch key={i} color={c} />)}
      </div>

      {isAdvanced && data.colors.semantic && (
        <>
          <h3 className="text-base font-semibold mb-3 border-l-4 border-blue-500 pl-3">Cores Semânticas (Feedback UI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <ColorSwatch color={data.colors.semantic.success} />
            <ColorSwatch color={data.colors.semantic.error} />
            <ColorSwatch color={data.colors.semantic.warning} />
            <ColorSwatch color={data.colors.semantic.info} />
          </div>
        </>
      )}

      {isAdvanced && data.colors.dataViz && (
        <>
          <h3 className="text-base font-semibold mb-3 border-l-4 border-purple-500 pl-3">DataViz (Gráficos)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.colors.dataViz.map((c, i) => <ColorSwatch key={i} color={c} />)}
          </div>
        </>
      )}
    </section>
  );
}
