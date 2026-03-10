"use client";
import { EditableField } from "@/components/EditableField";
import { useState, useCallback, useMemo } from "react";
import { BrandbookData, Color, Colors, ColorShade } from "@/lib/types";

/* ─── Constants ────────────────────────────────────────────────── */

const BASICS: Color[] = [
  { name: "Preto", hex: "#000000", rgb: "0, 0, 0", cmyk: "0, 0, 0, 100" },
  { name: "Branco", hex: "#FFFFFF", rgb: "255, 255, 255", cmyk: "0, 0, 0, 0" },
  { name: "Cinza 50%", hex: "#808080", rgb: "128, 128, 128", cmyk: "0, 0, 0, 50" },
];

/* ─── Utils ────────────────────────────────────────────────────── */

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

function textColor(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? "#000" : "#fff";
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text);
}

function colorInfoText(c: Color): string {
  const lines = [c.name, `HEX ${c.hex}`, `RGB ${c.rgb}`, `CMYK ${c.cmyk}`];
  if (c.pantone) lines.push(`Pantone ${c.pantone}`);
  if (c.usage) lines.push(`Uso: ${c.usage}`);
  if (c.tonalScale?.length) {
    lines.push("Escala: " + c.tonalScale.map(s => `${s.shade}:${s.hex}`).join(" "));
  }
  return lines.join("\n");
}

/* ─── Color Card (full, shareable) ─────────────────────────────── */

function ColorCard({
  color,
  label,
  onChange,
  onRemove,
}: {
  color: Color;
  label?: string;
  onChange?: (c: Color) => void;
  onRemove?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    copyToClipboard(colorInfoText(color));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const hasTonal = color.tonalScale && color.tonalScale.length > 0;

  return (
    <div className="color-card bg-white rounded-xl shadow-sm border overflow-hidden group relative">
      {/* Large color block */}
      <div
        className="h-24 w-full relative flex items-end px-3 pb-2"
        style={{ backgroundColor: color.hex }}
      >
        {label && (
          <span
            className="absolute top-2 left-3 text-[9px] font-bold uppercase tracking-wider opacity-70"
            style={{ color: textColor(color.hex) }}
          >
            {label}
          </span>
        )}
        <span
          className="text-sm font-mono font-bold drop-shadow-sm"
          style={{ color: textColor(color.hex) }}
        >
          {color.hex}
        </span>
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleCopy}
            className="no-print w-7 h-7 bg-black/20 backdrop-blur-sm text-white rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/40"
            title="Copiar dados da cor"
          >
            {copied ? "✓" : "📋"}
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="no-print w-7 h-7 bg-red-500/80 backdrop-blur-sm text-white rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
              title="Remover cor"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Info block */}
      <div className="px-3 py-2.5 space-y-1.5">
        <h4 className="font-bold text-sm leading-tight">
          <EditableField value={color.name} onSave={(v) => onChange?.({ ...color, name: v })} readOnly={!onChange} />
        </h4>

        {/* Color codes grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono text-gray-500">
          <div><span className="font-semibold text-gray-600">HEX</span> {color.hex}</div>
          <div><span className="font-semibold text-gray-600">RGB</span> <EditableField value={color.rgb} onSave={(v) => onChange?.({ ...color, rgb: v })} readOnly={!onChange} /></div>
          <div><span className="font-semibold text-gray-600">CMYK</span> <EditableField value={color.cmyk} onSave={(v) => onChange?.({ ...color, cmyk: v })} readOnly={!onChange} /></div>
          {color.pantone && (
            <div><span className="font-semibold text-gray-600">PMS</span> <EditableField value={color.pantone} onSave={(v) => onChange?.({ ...color, pantone: v })} readOnly={!onChange} /></div>
          )}
        </div>

        {/* Usage */}
        {color.usage && (
          <div className="text-[10px] text-gray-600 leading-relaxed pt-1 border-t border-gray-100">
            <span className="font-semibold">Uso:</span>{" "}
            <EditableField value={color.usage} onSave={(v) => onChange?.({ ...color, usage: v })} readOnly={!onChange} multiline />
          </div>
        )}

        {/* Tonal Scale integrated */}
        {hasTonal && (
          <TonalScaleInCard shades={color.tonalScale!} baseHex={color.hex} />
        )}
      </div>
    </div>
  );
}

/* ─── Tonal Scale inside card ──────────────────────────────────── */

function TonalScaleInCard({ shades, baseHex }: { shades: ColorShade[]; baseHex: string }) {
  return (
    <div className="pt-1.5 mt-1 border-t border-gray-100">
      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Escala Tonal</span>
      <div className="flex rounded-lg overflow-hidden border mt-1">
        {shades.map((s, i) => {
          const isBase = s.hex.toLowerCase() === baseHex.toLowerCase();
          return (
            <div
              key={i}
              className="flex-1 group/shade relative"
              style={{ backgroundColor: s.hex }}
              title={`${s.shade} — ${s.hex}`}
            >
              <div className={`h-8 w-full flex flex-col items-center justify-center ${isBase ? "ring-2 ring-inset ring-white/60" : ""}`}>
                <span
                  className="text-[7px] font-bold leading-none"
                  style={{ color: parseInt(s.shade) >= 500 ? "#fff" : "#000" }}
                >
                  {s.shade}
                </span>
                <span
                  className="text-[6px] font-mono opacity-0 group-hover/shade:opacity-100 transition-opacity leading-none mt-0.5"
                  style={{ color: parseInt(s.shade) >= 500 ? "#fff" : "#000" }}
                >
                  {s.hex}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Basics row (Preto, Branco, Cinza) ───────────────────────── */

function BasicsRow() {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-3 border-l-[3px] border-gray-300">
        Básicas
      </h3>
      <div className="flex gap-2">
        {BASICS.map((c) => (
          <div key={c.hex} className="flex items-center gap-1.5 bg-white border rounded-lg px-2.5 py-1.5">
            <div
              className="w-6 h-6 rounded-md border border-gray-200 shrink-0"
              style={{ backgroundColor: c.hex }}
            />
            <div>
              <span className="text-[11px] font-bold text-gray-700 block leading-tight">{c.name}</span>
              <span className="text-[9px] font-mono text-gray-400">{c.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Add Color form ───────────────────────────────────────────── */

function AddColorForm({ onAdd, onCancel }: { onAdd: (c: Color) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");

  function handleAdd() {
    onAdd({ name: name.trim() || "Nova Cor", hex, rgb: hexToRgb(hex), cmyk: "0, 0, 0, 0" });
  }

  return (
    <div className="no-print flex items-center gap-2 bg-gray-50 border rounded-lg p-2 mb-3">
      <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" aria-label="Escolher cor" />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da cor" className="flex-1 px-2 py-1 border rounded text-xs" />
      <button onClick={handleAdd} className="text-[11px] font-bold bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition">Adicionar</button>
      <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-700">×</button>
    </div>
  );
}

/* ─── Combination Pair ─────────────────────────────────────────── */

interface ComboPair {
  bg: { name: string; hex: string };
  fg: { name: string; hex: string };
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
}

function CombinationRow({
  pair,
  approved,
  onToggle,
}: {
  pair: ComboPair;
  approved: boolean;
  onToggle: () => void;
}) {
  const badge = pair.passAAA ? "AAA" : pair.passAA ? "AA" : "Falha";
  const badgeClass = pair.passAAA
    ? "bg-green-100 text-green-700"
    : pair.passAA
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-600";

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all w-full ${
        approved
          ? "border-green-300 bg-green-50/50 shadow-sm"
          : "border-gray-200 bg-white hover:bg-gray-50 opacity-60"
      }`}
    >
      {/* Visual preview */}
      <div
        className="w-10 h-7 rounded-md flex items-center justify-center shrink-0 border border-black/5"
        style={{ backgroundColor: pair.bg.hex }}
      >
        <span className="text-[10px] font-bold" style={{ color: pair.fg.hex }}>Aa</span>
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-medium text-gray-700 truncate block">
          {pair.bg.name} + {pair.fg.name}
        </span>
      </div>

      {/* Ratio + badge */}
      <span className="text-[10px] font-mono font-bold text-gray-500 shrink-0">{pair.ratio.toFixed(1)}:1</span>
      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badge}</span>

      {/* Toggle indicator */}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        approved ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
      }`}>
        <span className="text-[10px] font-bold">{approved ? "✓" : ""}</span>
      </div>
    </button>
  );
}

/* ─── WCAG Combinations Section ────────────────────────────────── */

function WCAGCombinations({
  allColors,
  approved,
  onToggle,
}: {
  allColors: Array<{ name: string; hex: string }>;
  approved: Set<string>;
  onToggle: (key: string) => void;
}) {
  const pairs = useMemo(() => {
    const result: ComboPair[] = [];
    for (let i = 0; i < allColors.length; i++) {
      for (let j = 0; j < allColors.length; j++) {
        if (i === j) continue;
        const ratio = contrastRatio(allColors[i].hex, allColors[j].hex);
        if (ratio < 2) continue; // skip very low contrast pairs
        // Deduplicate: only keep pair where i < j for same ratio
        const key = [allColors[i].hex, allColors[j].hex].sort().join("|");
        if (result.some(r => [r.bg.hex, r.fg.hex].sort().join("|") === key)) continue;
        result.push({
          bg: allColors[i],
          fg: allColors[j],
          ratio,
          passAA: ratio >= 4.5,
          passAAA: ratio >= 7,
        });
      }
    }
    return result.sort((a, b) => b.ratio - a.ratio);
  }, [allColors]);

  if (pairs.length === 0) return null;

  const suggested = pairs.filter(p => p.passAA);
  const others = pairs.filter(p => !p.passAA);

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold mb-1 border-l-[3px] border-indigo-500 pl-3">
        Combinações de Cores
      </h3>
      <p className="text-[10px] text-gray-400 mb-3 pl-3">
        Clique para aprovar/reprovar. AA ≥ 4.5 · AAA ≥ 7. Preto e branco disponíveis em todas.
      </p>

      {suggested.length > 0 && (
        <>
          <p className="text-[10px] font-semibold text-green-600 mb-1.5 pl-1">Recomendadas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-3">
            {suggested.map((p) => {
              const key = `${p.bg.hex}|${p.fg.hex}`;
              return (
                <CombinationRow
                  key={key}
                  pair={p}
                  approved={approved.has(key)}
                  onToggle={() => onToggle(key)}
                />
              );
            })}
          </div>
        </>
      )}

      {others.length > 0 && (
        <>
          <p className="text-[10px] font-semibold text-gray-400 mb-1.5 pl-1">Baixo contraste</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {others.map((p) => {
              const key = `${p.bg.hex}|${p.fg.hex}`;
              return (
                <CombinationRow
                  key={key}
                  pair={p}
                  approved={approved.has(key)}
                  onToggle={() => onToggle(key)}
                />
              );
            })}
          </div>
        </>
      )}
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
  const [showAddPrimary, setShowAddPrimary] = useState(false);
  const [showAddSecondary, setShowAddSecondary] = useState(false);

  // Approved combinations as a Set for O(1) lookup
  const approved = useMemo(() => {
    const set = new Set<string>();
    (data.colors.approvedCombinations || []).forEach((c) => set.add(`${c.bg}|${c.fg}`));
    return set;
  }, [data.colors.approvedCombinations]);

  // All valid hex colors including basics
  const allColors = useMemo(() => {
    const brand = [...data.colors.primary, ...data.colors.secondary].filter(
      (c) => /^#[0-9a-fA-F]{6}$/.test(c.hex)
    );
    return [...BASICS, ...brand];
  }, [data.colors.primary, data.colors.secondary]);

  const handleToggleCombo = useCallback(
    (key: string) => {
      if (!onUpdateColors) return;
      const [bg, fg] = key.split("|");
      const current = data.colors.approvedCombinations || [];
      const exists = current.some((c) => c.bg === bg && c.fg === fg);
      const next = exists
        ? current.filter((c) => !(c.bg === bg && c.fg === fg))
        : [...current, { bg, fg }];
      onUpdateColors({ ...data.colors, approvedCombinations: next });
    },
    [data.colors, onUpdateColors]
  );

  function updateColor(palette: "primary" | "secondary", i: number, c: Color) {
    onUpdateColors?.({ ...data.colors, [palette]: data.colors[palette].map((x, j) => (j === i ? c : x)) });
  }

  function removeColor(palette: "primary" | "secondary", i: number) {
    onUpdateColors?.({ ...data.colors, [palette]: data.colors[palette].filter((_, j) => j !== i) });
  }

  function addColor(palette: "primary" | "secondary", c: Color) {
    onUpdateColors?.({ ...data.colors, [palette]: [...data.colors[palette], c] });
  }

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Paleta de Cores
      </h2>

      {/* Basics — always present */}
      <BasicsRow />

      {/* Primary colors */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold pl-3 border-l-[3px] border-gray-800">Primárias</h3>
          {onUpdateColors && (
            <button
              onClick={() => setShowAddPrimary(!showAddPrimary)}
              className="no-print text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition"
            >
              + Cor
            </button>
          )}
        </div>
        {showAddPrimary && onUpdateColors && (
          <AddColorForm
            onAdd={(c) => { addColor("primary", c); setShowAddPrimary(false); }}
            onCancel={() => setShowAddPrimary(false)}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.colors.primary.map((c, i) => (
            <ColorCard
              key={i}
              color={c}
              label="Primária"
              onChange={onUpdateColors ? (next) => updateColor("primary", i, next) : undefined}
              onRemove={onUpdateColors ? () => removeColor("primary", i) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Secondary colors */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold pl-3 border-l-[3px] border-gray-400">Secundárias</h3>
          {onUpdateColors && (
            <button
              onClick={() => setShowAddSecondary(!showAddSecondary)}
              className="no-print text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition"
            >
              + Cor
            </button>
          )}
        </div>
        {showAddSecondary && onUpdateColors && (
          <AddColorForm
            onAdd={(c) => { addColor("secondary", c); setShowAddSecondary(false); }}
            onCancel={() => setShowAddSecondary(false)}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.colors.secondary.map((c, i) => (
            <ColorCard
              key={i}
              color={c}
              label="Secundária"
              onChange={onUpdateColors ? (next) => updateColor("secondary", i, next) : undefined}
              onRemove={onUpdateColors ? () => removeColor("secondary", i) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Semantic colors (if advanced) */}
      {isAdvanced && data.colors.semantic && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold pl-3 border-l-[3px] border-blue-500 mb-2">Semânticas (UI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["success", "error", "warning", "info"] as const).map((key) => (
              <ColorCard
                key={key}
                color={data.colors.semantic![key]}
                label={key}
                onChange={
                  onUpdateColors
                    ? (next) =>
                        onUpdateColors({ ...data.colors, semantic: { ...data.colors.semantic!, [key]: next } })
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* DataViz colors (if advanced) */}
      {isAdvanced && data.colors.dataViz && data.colors.dataViz.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold pl-3 border-l-[3px] border-purple-500 mb-2">DataViz</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.colors.dataViz.map((c, i) => (
              <ColorCard
                key={i}
                color={c}
                label="DataViz"
                onChange={
                  onUpdateColors
                    ? (next) =>
                        onUpdateColors({
                          ...data.colors,
                          dataViz: data.colors.dataViz!.map((x, j) => (j === i ? next : x)),
                        })
                    : undefined
                }
                onRemove={
                  onUpdateColors
                    ? () =>
                        onUpdateColors({
                          ...data.colors,
                          dataViz: data.colors.dataViz!.filter((_, j) => j !== i),
                        })
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* WCAG Combinations — interactive approval */}
      {allColors.length >= 2 && (
        <WCAGCombinations
          allColors={allColors}
          approved={approved}
          onToggle={handleToggleCombo}
        />
      )}
    </section>
  );
}
