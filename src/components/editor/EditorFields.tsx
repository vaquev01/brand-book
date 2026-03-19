"use client";

import { useState } from "react";
import { BrandbookData, Color, Mascot, Typography } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════════
   SHARED TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

export interface EditorTabProps {
  data: BrandbookData;
  onPatch: (partial: Partial<BrandbookData>) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FIELD COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

export function Field({ label, value, onChange, multiline = false, rows = 3, placeholder }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="app-textarea text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="app-input text-sm"
        />
      )}
    </div>
  );
}

interface ArrayEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
}

export function ArrayEditor({ label, items, onChange, addLabel = "Adicionar" }: ArrayEditorProps) {
  const [draft, setDraft] = useState("");

  function addItem() {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="mb-2 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="app-input flex-1 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="w-6 shrink-0 text-lg leading-none text-gray-400 transition hover:text-red-500"
              aria-label="Remover item"
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder={`+ ${addLabel}...`}
          className="app-input flex-1 border-dashed px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!draft.trim()}
          className="app-primary-button px-3 py-2 text-xs"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface ColorEditorProps {
  color: Color;
  onChange: (c: Color) => void;
  onRemove: () => void;
}

export function ColorEditor({ color, onChange, onRemove }: ColorEditorProps) {
  return (
    <div className="app-surface-soft space-y-2 p-3">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color.hex.startsWith("#") ? color.hex : "#000000"}
          onChange={(e) => onChange({ ...color, hex: e.target.value })}
          className="h-10 w-10 shrink-0 cursor-pointer rounded border"
          title="Escolher cor"
        />
        <input
          type="text"
          value={color.name}
          onChange={(e) => onChange({ ...color, name: e.target.value })}
          placeholder="Nome da cor"
          className="app-input flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="w-6 shrink-0 text-lg leading-none text-gray-400 transition hover:text-red-500"
          aria-label="Remover cor"
          title="Remover"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          value={color.hex}
          onChange={(e) => onChange({ ...color, hex: e.target.value })}
          placeholder="HEX"
          className="app-input px-3 py-2 text-xs font-mono"
        />
        <input
          type="text"
          value={color.rgb}
          onChange={(e) => onChange({ ...color, rgb: e.target.value })}
          placeholder="RGB"
          className="app-input px-3 py-2 text-xs font-mono"
        />
        <input
          type="text"
          value={color.cmyk}
          onChange={(e) => onChange({ ...color, cmyk: e.target.value })}
          placeholder="CMYK"
          className="app-input px-3 py-2 text-xs font-mono"
        />
      </div>
    </div>
  );
}

interface TypographyEditorProps {
  label: string;
  value: Typography | undefined;
  onChange: (t: Typography) => void;
}

export function TypographyEditor({ label, value, onChange }: TypographyEditorProps) {
  const t = value ?? { name: "", usage: "", weights: [] };
  return (
    <div className="app-surface-soft space-y-3 p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</h4>
      <Field label="Familia" value={t.name} onChange={(v) => onChange({ ...t, name: v })} placeholder="Ex: Inter, Playfair Display..." />
      <Field label="Uso" value={t.usage} onChange={(v) => onChange({ ...t, usage: v })} placeholder="Ex: Headlines, corpo de texto..." />
      <ArrayEditor label="Pesos" items={t.weights} onChange={(w) => onChange({ ...t, weights: w })} addLabel="Peso (ex: 400, 700, Bold)" />
    </div>
  );
}

interface MascotEditorProps {
  mascot: Mascot;
  index: number;
  onChange: (m: Mascot) => void;
  onRemove: () => void;
}

export function MascotEditorCard({ mascot, index, onChange, onRemove }: MascotEditorProps) {
  return (
    <div className="app-surface-soft space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Mascote {index + 1}</h4>
        <button onClick={onRemove} className="text-xs font-medium text-gray-400 transition hover:text-red-500">Remover</button>
      </div>
      <Field label="Nome" value={mascot.name} onChange={(v) => onChange({ ...mascot, name: v })} placeholder="Ex: Flux, Bolinha, Kana..." />
      <Field label="Descricao Visual" value={mascot.description} onChange={(v) => onChange({ ...mascot, description: v })} multiline rows={3} placeholder="Aparencia, cores, tracos, estilo de ilustracao..." />
      <Field label="Personalidade" value={mascot.personality} onChange={(v) => onChange({ ...mascot, personality: v })} multiline rows={2} placeholder="Como se comporta, voz, valores do personagem..." />
      <ArrayEditor label="Diretrizes de Uso" items={mascot.usageGuidelines} onChange={(g) => onChange({ ...mascot, usageGuidelines: g })} addLabel="Diretriz de uso" />
    </div>
  );
}

export function EmptySection({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="app-surface-soft border-2 border-dashed border-slate-200 py-10 text-center text-gray-400">
      <p className="text-sm font-medium">Nenhum dado de {label}</p>
      <p className="mt-1 text-xs">Clique abaixo para adicionar manualmente</p>
      <button type="button" onClick={onAdd} className="app-primary-button mt-4 px-4 py-2 text-xs">
        + Criar {label}
      </button>
    </div>
  );
}
