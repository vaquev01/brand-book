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

/* ─── Compact Color Swatch ─────────────────────────────────────── */

function ColorSwatch({ color, onChange, onRemove }: { color: Color; onChange?: (c: Color) => void; onRemove?: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="color-swatch bg-white rounded-lg shadow-sm border overflow-hidden relative group">
      {/* Color block — compact height with hex overlay */}
      <div
        className="h-14 w-full flex items-end justify-between px-2 pb-1 cursor-pointer"
        style={{ backgroundColor: color.hex }}
        onClick={() => setExpanded(!expanded)}
        title="Clique para expandir detalhes"
      >
        <span
          className="text-[10px] font-mono font-bold drop-shadow-sm"
          style={{ color: relativeLuminance(color.hex) > 0.4 ? "#000" : "#fff" }}
        >
          {color.hex}
        </span>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="no-print w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            title="Remover cor"
          >×</button>
        )}
      </div>
      {/* Name + condensed codes */}
      <div className="px-2 py-1.5">
        <h4 className="font-bold text-[11px] leading-tight truncate" title={color.name}>
          <EditableField value={color.name} onSave={(v) => onChange?.({ ...color, name: v })} readOnly={!onChange} />
        </h4>
        <div className="text-[9px] text-gray-400 font-mono mt-0.5 leading-snug">
          <EditableField value={color.rgb} onSave={(v) => onChange?.({ ...color, rgb: v })} readOnly={!onChange} />
          {color.pantone && <> · <EditableField value={color.pantone} onSave={(v) => onChange?.({ ...color, pantone: v })} readOnly={!onChange} /></>}
        </div>
        {/* Expandable: CMYK + usage */}
        {expanded && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-100 space-y-1">
            <div className="text-[9px] text-gray-500 font-mono">
              <span className="font-semibold text-gray-600">CMYK:</span> <EditableField value={color.cmyk} onSave={(v) => onChange?.({ ...color, cmyk: v })} readOnly={!onChange} />
            </div>
            {color.usage && (
              <div className="text-[9px] text-gray-600 leading-relaxed">
                <span className="font-semibold">Uso:</span> <EditableField value={color.usage} onSave={(v) => onChange?.({ ...color, usage: v })} readOnly={!onChange} multiline />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tonal Scale Strip (compact) ──────────────────────────────── */

function TonalScaleStrip({ color }: { color: Color }) {
  if (!color.tonalScale || color.tonalScale.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
        <span className="text-[11px] font-bold text-gray-700">{color.name}</span>
      </div>
      <div className="flex rounded-md overflow-hidden border">
        {color.tonalScale.map((s, i) => (
          <div key={i} className="flex-1 group/shade" style={{ backgroundColor: s.hex }}>
            <div className="h-7 w-full relative">
              <span
                className="absolute inset-0 flex items-center justify-center text-[8px] font-bold opacity-0 group-hover/shade:opacity-100 transition-opacity"
                style={{ color: parseInt(s.shade) >= 500 ? "#fff" : "#000" }}
              >
                {s.shade} {s.hex}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reusable palette section ─────────────────────────────────── */

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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold pl-3" style={{ borderLeft: `3px solid ${borderColor}` }}>{title}</h3>
        {onAdd && (
          <button onClick={() => setShowAdd(!showAdd)} className="no-print text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition">+ Add</button>
        )}
      </div>
      {showAdd && onAdd && (
        <div className="no-print mb-2 flex items-center gap-2 bg-gray-50 border rounded-lg p-2">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" aria-label="Escolher cor" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="flex-1 px-2 py-1 border rounded text-xs" />
          <button onClick={handleAdd} className="text-[11px] font-bold bg-gray-900 text-white px-2.5 py-1.5 rounded-md hover:bg-gray-800 transition">Add</button>
          <button onClick={() => setShowAdd(false)} className="text-xs text-gray-400 hover:text-gray-700">×</button>
        </div>
      )}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4 items-start">
        {colors.map((c, i) => (
          <ColorSwatch key={i} color={c} onChange={onUpdate ? (next) => onUpdate(i, next) : undefined} onRemove={onRemove ? () => onRemove(i) : undefined} />
        ))}
      </div>
    </>
  );
}

/* ─── WCAG Contrast Matrix (compact) ──────────────────────────── */

function WCAGMatrix({ colors }: { colors: Array<{ name: string; hex: string }> }) {
  if (colors.length < 2) return null;
  const pairs = colors.slice(0, 8);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-1 border-l-[3px] border-indigo-500 pl-3">Contraste WCAG</h3>
      <p className="text-[10px] text-gray-400 mb-2 pl-3">AA ≥ 4.5 · AAA ≥ 7</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-[10px] font-mono border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1.5 text-left text-gray-400 font-bold border-b border-r border-gray-200 w-20" />
              {pairs.map((c) => (
                <th key={c.name} className="px-1.5 py-1.5 text-center border-b border-gray-200 min-w-[56px]">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                    <span className="text-[8px] text-gray-400 truncate max-w-[52px]">{c.name.split(" ")[0]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map((bg) => (
              <tr key={bg.name} className="border-b border-gray-50 last:border-0">
                <td className="px-2 py-1 border-r border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: bg.hex }} />
                    <span className="text-[8px] text-gray-400 truncate max-w-[48px]">{bg.name.split(" ")[0]}</span>
                  </div>
                </td>
                {pairs.map((fg) => {
                  const ratio = contrastRatio(bg.hex, fg.hex);
                  const passAAA = ratio >= 7;
                  const passAA = ratio >= 4.5;
                  const isSame = bg.hex === fg.hex;
                  return (
                    <td key={fg.name} className="px-0.5 py-1 text-center" title={`${ratio.toFixed(2)}:1`}>
                      {isSame ? (
                        <span className="text-gray-200">—</span>
                      ) : (
                        <div className="rounded px-0.5 py-0.5 flex flex-col items-center" style={{ backgroundColor: bg.hex }}>
                          <span className="font-bold text-[9px] leading-none" style={{ color: fg.hex }}>{ratio.toFixed(1)}</span>
                          <span className={`text-[7px] font-bold px-0.5 rounded mt-0.5 ${passAAA ? "bg-green-500 text-white" : passAA ? "bg-yellow-400 text-gray-900" : "bg-red-500 text-white"}`}>
                            {passAAA ? "AAA" : passAA ? "AA" : "✗"}
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
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-3 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Paleta de Cores
      </h2>

      <PaletteSection title="Primárias" borderColor="#1f2937" colors={data.colors.primary} {...updatePalette("primary")} />
      <PaletteSection title="Secundárias" borderColor="#9ca3af" colors={data.colors.secondary} {...updatePalette("secondary")} />

      {isAdvanced && data.colors.semantic && (
        <PaletteSection
          title="Semânticas (UI)"
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
          title="DataViz"
          borderColor="#a855f7"
          colors={data.colors.dataViz}
          onUpdate={onUpdateColors ? (i, c) => onUpdateColors({ ...data.colors, dataViz: data.colors.dataViz!.map((x, j) => j === i ? c : x) }) : undefined}
          onRemove={onUpdateColors ? (i) => onUpdateColors({ ...data.colors, dataViz: data.colors.dataViz!.filter((_, j) => j !== i) }) : undefined}
          onAdd={onUpdateColors ? (c) => onUpdateColors({ ...data.colors, dataViz: [...(data.colors.dataViz || []), c] }) : undefined}
        />
      )}

      {/* Tonal Scales — compact hover-reveal strips */}
      {(() => {
        const withScale = [...data.colors.primary, ...data.colors.secondary].filter(c => c.tonalScale && c.tonalScale.length > 0);
        if (withScale.length === 0) return null;
        return (
          <>
            <h3 className="text-sm font-semibold mb-2 border-l-[3px] border-gray-600 pl-3">Escalas Tonais</h3>
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
