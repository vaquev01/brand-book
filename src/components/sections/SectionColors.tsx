"use client";
import { useState } from "react";
import { BrandbookData, Color, Colors } from "@/lib/types";

function ColorSwatch({ color, onRemove }: { color: Color; onRemove?: () => void }) {
  return (
    <div className="color-swatch bg-white rounded-lg shadow-sm border overflow-hidden relative group">
      <div className="h-20 w-full" style={{ backgroundColor: color.hex }} />
      {onRemove && (
        <button
          onClick={onRemove}
          className="no-print absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          title="Remover cor"
        >
          ×
        </button>
      )}
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
        {color.tonalScale && color.tonalScale.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Escala Tonal</p>
            <div className="flex rounded overflow-hidden">
              {color.tonalScale.map((s, i) => (
                <div
                  key={i}
                  className="flex-1 h-5 relative group/shade"
                  style={{ backgroundColor: s.hex }}
                  title={`${s.shade}: ${s.hex}`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold opacity-0 group-hover/shade:opacity-100 transition-opacity" style={{ color: parseInt(s.shade) >= 500 ? '#fff' : '#000' }}>{s.shade}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TonalScaleStrip({ color }: { color: Color }) {
  if (!color.tonalScale || color.tonalScale.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
        <span className="text-xs font-bold text-gray-700">{color.name}</span>
      </div>
      <div className="flex rounded-lg overflow-hidden shadow-sm border">
        {color.tonalScale.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group/shade" style={{ backgroundColor: s.hex }}>
            <div className="h-10 w-full" />
            <div className="w-full text-center py-1" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
              <span className="block text-[9px] font-bold text-gray-800">{s.shade}</span>
              <span className="block text-[8px] font-mono text-gray-500">{s.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

interface Props {
  data: BrandbookData;
  num: number;
  onUpdateColors?: (colors: Colors) => void;
}

export function SectionColors({ data, num, onUpdateColors }: Props) {
  const isAdvanced = !!data.colors.semantic;
  const [showAddPrimary, setShowAddPrimary] = useState(false);
  const [showAddSecondary, setShowAddSecondary] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  function addColor(palette: "primary" | "secondary") {
    if (!onUpdateColors) return;
    const name = newColorName.trim() || "Nova Cor";
    const newColor: Color = {
      name,
      hex: newColorHex,
      rgb: hexToRgb(newColorHex),
      cmyk: "0, 0, 0, 0",
    };
    const updated = { ...data.colors, [palette]: [...data.colors[palette], newColor] };
    onUpdateColors(updated);
    setNewColorName("");
    setNewColorHex("#000000");
    if (palette === "primary") setShowAddPrimary(false);
    else setShowAddSecondary(false);
  }

  function removeColor(palette: "primary" | "secondary", index: number) {
    if (!onUpdateColors) return;
    const updated = { ...data.colors, [palette]: data.colors[palette].filter((_, i) => i !== index) };
    onUpdateColors(updated);
  }

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Paleta de Cores
      </h2>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold border-l-4 border-gray-800 pl-3">Cores Primárias</h3>
        {onUpdateColors && (
          <button
            onClick={() => setShowAddPrimary(!showAddPrimary)}
            className="no-print text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            + Adicionar
          </button>
        )}
      </div>
      {showAddPrimary && onUpdateColors && (
        <div className="no-print mb-3 flex items-center gap-2 bg-gray-50 border rounded-lg p-3">
          <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" aria-label="Escolher cor" />
          <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nome da cor" className="flex-1 px-2 py-1.5 border rounded text-sm" />
          <button onClick={() => addColor("primary")} className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition">Add</button>
          <button onClick={() => setShowAddPrimary(false)} className="text-xs text-gray-400 hover:text-gray-700 transition">×</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 items-start">
        {data.colors.primary.map((c, i) => (
          <ColorSwatch key={i} color={c} onRemove={onUpdateColors ? () => removeColor("primary", i) : undefined} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold border-l-4 border-gray-400 pl-3">Cores Secundárias</h3>
        {onUpdateColors && (
          <button
            onClick={() => setShowAddSecondary(!showAddSecondary)}
            className="no-print text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            + Adicionar
          </button>
        )}
      </div>
      {showAddSecondary && onUpdateColors && (
        <div className="no-print mb-3 flex items-center gap-2 bg-gray-50 border rounded-lg p-3">
          <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" aria-label="Escolher cor" />
          <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Nome da cor" className="flex-1 px-2 py-1.5 border rounded text-sm" />
          <button onClick={() => addColor("secondary")} className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition">Add</button>
          <button onClick={() => setShowAddSecondary(false)} className="text-xs text-gray-400 hover:text-gray-700 transition">×</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 items-start">
        {data.colors.secondary.map((c, i) => (
          <ColorSwatch key={i} color={c} onRemove={onUpdateColors ? () => removeColor("secondary", i) : undefined} />
        ))}
      </div>

      {isAdvanced && data.colors.semantic && (
        <>
          <h3 className="text-base font-semibold mb-3 border-l-4 border-blue-500 pl-3">Cores Semânticas (Feedback UI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 items-start">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 items-start">
            {data.colors.dataViz.map((c, i) => <ColorSwatch key={i} color={c} />)}
          </div>
        </>
      )}

      {/* Tonal Scale Strips — full-width view for colors that have scales */}
      {(() => {
        const colorsWithScale = [...data.colors.primary, ...data.colors.secondary].filter(c => c.tonalScale && c.tonalScale.length > 0);
        if (colorsWithScale.length === 0) return null;
        return (
          <>
            <h3 className="text-base font-semibold mb-3 border-l-4 border-gray-600 pl-3">Escalas Tonais (50–900)</h3>
            {colorsWithScale.map((c, i) => <TonalScaleStrip key={i} color={c} />)}
          </>
        );
      })()}

      {isAdvanced && data.colors.semantic && (
        <div className="mt-5 bg-gray-50 border rounded-lg p-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Regras de Uso Semântico</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: data.colors.semantic.error.hex }} />
              <span>Erros devem combinar <strong>cor + texto explicativo</strong>. Nunca depender apenas de cor.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: data.colors.semantic.success.hex }} />
              <span>Sucesso confirmado com <strong>feedback visual + mensagem</strong> de conclusão.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: data.colors.semantic.warning.hex }} />
              <span>Alertas devem ter <strong>borda + texto</strong>, sem bloquear a ação do usuário.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: data.colors.semantic.info.hex }} />
              <span>Informações contextuais em <strong>banners discretos</strong> ou tooltips, nunca modais.</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
