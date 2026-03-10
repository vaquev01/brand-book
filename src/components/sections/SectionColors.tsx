"use client";
import { EditableField } from "@/components/EditableField";
import { useState } from "react";
import { BrandbookData, Color, Colors } from "@/lib/types";

/* ─── Utils ─────────────────────────────────────────────────────── */

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  return `${parseInt(h.substring(0, 2), 16) || 0}, ${parseInt(h.substring(2, 4), 16) || 0}, ${parseInt(h.substring(4, 6), 16) || 0}`;
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ].map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* ─── ColorSwatch (compact — tonal scale lives only in full-width strip) */

function ColorSwatch({ color, onChange, onRemove }: { color: Color; onChange?: (c: Color) => void; onRemove?: () => void }) {
  return (
    <div className="color-swatch bg-white rounded-lg shadow-sm border overflow-hidden relative group">
      <div className="h-20 w-full" style={{ backgroundColor: color.hex }} />
      {onRemove && (
        <button onClick={onRemove} className="no-print absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" title="Remover cor">×</button>
      )}
      <div className="p-3">
        <h4 className="font-bold text-xs mb-1" title={color.name}>
          <EditableField value={color.name} onSave={(v) => onChange?.({ ...color, name: v })} readOnly={!onChange} />
        </h4>
        <div className="text-[10px] text-gray-500 space-y-0.5 font-mono">
          <div><span className="font-semibold text-gray-700">HEX:</span> <EditableField value={color.hex} onSave={(v) => onChange?.({ ...color, hex: v })} readOnly={!onChange} /></div>
          <div><span className="font-semibold text-gray-700">RGB:</span> <EditableField value={color.rgb} onSave={(v) => onChange?.({ ...color, rgb: v })} readOnly={!onChange} /></div>
          <div><span className="font-semibold text-gray-700">CMYK:</span> <EditableField value={color.cmyk} onSave={(v) => onChange?.({ ...color, cmyk: v })} readOnly={!onChange} /></div>
          {color.pantone && <div><span className="font-semibold text-gray-700">Pantone:</span> <EditableField value={color.pantone} onSave={(v) => onChange?.({ ...color, pantone: v })} readOnly={!onChange} /></div>}
        </div>
        {color.usage && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-[10px] text-gray-600 leading-relaxed"><span className="font-semibold text-gray-700">Uso:</span> <EditableField value={color.usage} onSave={(v) => onChange?.({ ...color, usage: v })} readOnly={!onChange} multiline /></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tonal Scale Strip (single source of truth for scales) ────── */

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
          <div key={i} className="flex-1 flex flex-col items-center" style={{ backgroundColor: s.hex }}>
            <div className="h-10 w-full" />
            <div className="w-full text-center py-1" style={{ backgroundColor: "rgba(255,255,255,0.85)" }}>
              <span className="block text-[9px] font-bold text-gray-800">{s.shade}</span>
              <span className="block text-[8px] font-mono text-gray-500">{s.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reusable palette section (header + optional add + grid) ──── */

function PaletteSection({
  title,
  borderColor,
  colors,
  onUpdate,
  onRemove,
  onAdd,
}: {
  title: string;
  borderColor: string;
  colors: Color[];
  onUpdate?: (i: number, c: Color) => void;
  onRemove?: (i: number) => void;
  onAdd?: (c: Color) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");

  function handleAdd() {
    onAdd?.({ name: name.trim() || "Nova Cor", hex, rgb: hexToRgb(hex), cmyk: "0, 0, 0, 0" });
    setName("");
    setHex("#000000");
    setShowAdd(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold pl-3" style={{ borderLeft: `4px solid ${borderColor}` }}>{title}</h3>
        {onAdd && (
          <button onClick={() => setShowAdd(!showAdd)} className="no-print text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">+ Adicionar</button>
        )}
      </div>
      {showAdd && onAdd && (
        <div className="no-print mb-3 flex items-center gap-2 bg-gray-50 border rounded-lg p-3">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" aria-label="Escolher cor" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da cor" className="flex-1 px-2 py-1.5 border rounded text-sm" />
          <button onClick={handleAdd} className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition">Add</button>
          <button onClick={() => setShowAdd(false)} className="text-xs text-gray-400 hover:text-gray-700 transition">×</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 items-start">
        {colors.map((c, i) => (
          <ColorSwatch key={i} color={c} onChange={onUpdate ? (next) => onUpdate(i, next) : undefined} onRemove={onRemove ? () => onRemove(i) : undefined} />
        ))}
      </div>
    </>
  );
}

/* ─── WCAG Contrast Matrix ─────────────────────────────────────── */

function WCAGMatrix({ colors }: { colors: Array<{ name: string; hex: string }> }) {
  if (colors.length < 2) return null;
  const pairs = colors.slice(0, 8);

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold mb-1 border-l-4 border-indigo-500 pl-3">Matriz de Contraste WCAG</h3>
      <p className="text-xs text-gray-500 mb-3 pl-4">AA ≥ 4.5:1 (texto) · AAA ≥ 7:1</p>
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <table className="min-w-full text-[11px] font-mono border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-gray-400 font-bold border-b border-r border-gray-200 w-28">bg \ text</th>
              {pairs.map((c) => (
                <th key={c.name} className="px-2 py-2 text-center border-b border-gray-200 min-w-[72px]">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} />
                    <span className="text-[9px] text-gray-500 leading-tight truncate max-w-[90px]" title={c.name}>{c.name.split(" ")[0]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map((bg) => (
              <tr key={bg.name} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-1.5 border-r border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: bg.hex }} />
                    <span className="text-[9px] text-gray-500 truncate max-w-[90px]" title={bg.name}>{bg.name.split(" ")[0]}</span>
                  </div>
                </td>
                {pairs.map((fg) => {
                  const ratio = contrastRatio(bg.hex, fg.hex);
                  const passAAA = ratio >= 7;
                  const passAA = ratio >= 4.5;
                  const isSame = bg.hex === fg.hex;
                  return (
                    <td key={fg.name} className="px-1 py-1.5 text-center" title={`${bg.name} / ${fg.name}: ${ratio.toFixed(2)}:1`}>
                      {isSame ? (
                        <span className="text-gray-200">—</span>
                      ) : (
                        <div className="rounded-md px-1 py-1 flex flex-col items-center gap-0.5" style={{ backgroundColor: bg.hex }}>
                          <span className="font-bold text-[10px] leading-none" style={{ color: fg.hex }}>{ratio.toFixed(1)}</span>
                          <span className={`text-[8px] font-bold leading-none px-1 rounded ${passAAA ? "bg-green-500 text-white" : passAA ? "bg-yellow-400 text-gray-900" : "bg-red-500 text-white"}`}>
                            {passAAA ? "AAA" : passAA ? "AA" : "FAIL"}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Section ─────────────────────────────────────────────── */

interface Props {
  data: BrandbookData;
  num: number;
  onUpdateColors?: (colors: Colors) => void;
}

export function SectionColors({ data, num, onUpdateColors }: Props) {
  const isAdvanced = !!data.colors.semantic;

  function updatePalette(palette: "primary" | "secondary") {
    return {
      onUpdate: onUpdateColors
        ? (i: number, c: Color) => onUpdateColors({ ...data.colors, [palette]: data.colors[palette].map((x, j) => j === i ? c : x) })
        : undefined,
      onRemove: onUpdateColors
        ? (i: number) => onUpdateColors({ ...data.colors, [palette]: data.colors[palette].filter((_, j) => j !== i) })
        : undefined,
      onAdd: onUpdateColors
        ? (c: Color) => onUpdateColors({ ...data.colors, [palette]: [...data.colors[palette], c] })
        : undefined,
    };
  }

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Paleta de Cores
      </h2>

      <PaletteSection title="Cores Primárias" borderColor="#1f2937" colors={data.colors.primary} {...updatePalette("primary")} />
      <PaletteSection title="Cores Secundárias" borderColor="#9ca3af" colors={data.colors.secondary} {...updatePalette("secondary")} />

      {isAdvanced && data.colors.semantic && (
        <PaletteSection
          title="Cores Semânticas (Feedback UI)"
          borderColor="#3b82f6"
          colors={[data.colors.semantic.success, data.colors.semantic.error, data.colors.semantic.warning, data.colors.semantic.info]}
          onUpdate={onUpdateColors ? (i, c) => {
            const keys = ["success", "error", "warning", "info"] as const;
            onUpdateColors({ ...data.colors, semantic: { ...data.colors.semantic!, [keys[i]]: c } });
          } : undefined}
        />
      )}

      {isAdvanced && data.colors.dataViz && data.colors.dataViz.length > 0 && (
        <PaletteSection
          title="DataViz (Gráficos)"
          borderColor="#a855f7"
          colors={data.colors.dataViz}
          onUpdate={onUpdateColors ? (i, c) => onUpdateColors({ ...data.colors, dataViz: data.colors.dataViz!.map((x, j) => j === i ? c : x) }) : undefined}
          onRemove={onUpdateColors ? (i) => onUpdateColors({ ...data.colors, dataViz: data.colors.dataViz!.filter((_, j) => j !== i) }) : undefined}
          onAdd={onUpdateColors ? (c) => onUpdateColors({ ...data.colors, dataViz: [...(data.colors.dataViz || []), c] }) : undefined}
        />
      )}

      {/* Tonal Scales — full-width strips (single source, not duplicated per card) */}
      {(() => {
        const withScale = [...data.colors.primary, ...data.colors.secondary].filter(c => c.tonalScale && c.tonalScale.length > 0);
        if (withScale.length === 0) return null;
        return (
          <>
            <h3 className="text-base font-semibold mb-3 border-l-4 border-gray-600 pl-3">Escalas Tonais (50–900)</h3>
            {withScale.map((c, i) => <TonalScaleStrip key={i} color={c} />)}
          </>
        );
      })()}

      {/* WCAG Contrast Matrix */}
      {(() => {
        const all = [...data.colors.primary, ...data.colors.secondary].filter(c => /^#[0-9a-fA-F]{6}$/.test(c.hex));
        return all.length >= 2 ? <WCAGMatrix colors={all} /> : null;
      })()}
    </section>
  );
}
