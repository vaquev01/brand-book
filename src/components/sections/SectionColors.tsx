"use client";
import { BrandbookData, Color } from "@/lib/types";

function ColorSwatch({ color }: { color: Color }) {
  return (
    <div className="color-swatch bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-28 w-full" style={{ backgroundColor: color.hex }} />
      <div className="p-3">
        <h4 className="font-bold text-xs mb-1 truncate" title={color.name}>{color.name}</h4>
        <div className="text-[10px] text-gray-500 space-y-0.5 font-mono">
          <p><span className="font-semibold text-gray-700">HEX:</span> {color.hex}</p>
          <p><span className="font-semibold text-gray-700">RGB:</span> {color.rgb}</p>
          <p><span className="font-semibold text-gray-700">CMYK:</span> {color.cmyk}</p>
        </div>
      </div>
    </div>
  );
}

export function SectionColors({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.colors.semantic;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Paleta de Cores</h2>

      <h3 className="text-xl font-semibold mb-4 border-l-4 border-gray-800 pl-3">Cores Primárias</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {data.colors.primary.map((c, i) => <ColorSwatch key={i} color={c} />)}
      </div>

      <h3 className="text-xl font-semibold mb-4 border-l-4 border-gray-400 pl-3">Cores Secundárias</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {data.colors.secondary.map((c, i) => <ColorSwatch key={i} color={c} />)}
      </div>

      {isAdvanced && data.colors.semantic && (
        <>
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">Cores Semânticas (Feedback UI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <ColorSwatch color={data.colors.semantic.success} />
            <ColorSwatch color={data.colors.semantic.error} />
            <ColorSwatch color={data.colors.semantic.warning} />
            <ColorSwatch color={data.colors.semantic.info} />
          </div>
        </>
      )}

      {isAdvanced && data.colors.dataViz && (
        <>
          <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-3">DataViz (Gráficos)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.colors.dataViz.map((c, i) => <ColorSwatch key={i} color={c} />)}
          </div>
        </>
      )}
    </section>
  );
}
