"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

export function SectionTokensA11y({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.designTokens || !data.accessibility) return null;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Design Tokens &amp; Acessibilidade
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h3 className="text-base font-bold mb-3">Acessibilidade (WCAG 2.2)</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Contraste Rigoroso</h4>
              <EditableField value={data.accessibility.contrastRules} onSave={(val) => onUpdateData?.(prev => prev.accessibility ? { ...prev, accessibility: { ...prev.accessibility, contrastRules: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Navegação por Teclado (Focus)</h4>
              <EditableField value={data.accessibility.focusStates} onSave={(val) => onUpdateData?.(prev => prev.accessibility ? { ...prev, accessibility: { ...prev.accessibility, focusStates: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-indigo-500 shadow-sm">
              <h4 className="font-bold text-sm text-indigo-900 mb-1">Independência de Cor</h4>
              <EditableField value={data.accessibility.colorIndependence} onSave={(val) => onUpdateData?.(prev => prev.accessibility ? { ...prev, accessibility: { ...prev.accessibility, colorIndependence: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">Design Tokens</h3>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-4">
            <div>
              <span className="text-blue-400 block mb-2">{"// Spacing Tokens"}</span>
              <ul className="space-y-1">
                {data.designTokens.spacing.map((t, i) => <li key={i} className="group/item"><EditableField value={t} onSave={(val) => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, spacing: prev.designTokens.spacing.map((item, idx) => idx === i ? val : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, spacing: prev.designTokens.spacing.filter((_, idx) => idx !== i) } } : prev) : undefined} readOnly={!onUpdateData} /></li>)}
              </ul>
              {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, spacing: [...prev.designTokens.spacing, "space-new"] } } : prev)} className="no-print mt-2 text-[10px] font-bold text-blue-300 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">+ Adicionar</button>}
            </div>
            <div>
              <span className="text-blue-400 block mb-2">{"// Border Radius Tokens"}</span>
              <ul className="space-y-1">
                {data.designTokens.borderRadii.map((t, i) => <li key={i} className="group/item"><EditableField value={t} onSave={(val) => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, borderRadii: prev.designTokens.borderRadii.map((item, idx) => idx === i ? val : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, borderRadii: prev.designTokens.borderRadii.filter((_, idx) => idx !== i) } } : prev) : undefined} readOnly={!onUpdateData} /></li>)}
              </ul>
              {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, borderRadii: [...prev.designTokens.borderRadii, "radius-new"] } } : prev)} className="no-print mt-2 text-[10px] font-bold text-blue-300 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">+ Adicionar</button>}
            </div>
            {data.designTokens.shadows && data.designTokens.shadows.length > 0 && (
              <div>
                <span className="text-purple-400 block mb-2">{"// Shadow Tokens"}</span>
                <ul className="space-y-1">
                  {data.designTokens.shadows.map((t, i) => <li key={i} className="group/item"><EditableField value={t} onSave={(val) => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, shadows: (prev.designTokens.shadows || []).map((item, idx) => idx === i ? val : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, shadows: (prev.designTokens.shadows || []).filter((_, idx) => idx !== i) } } : prev) : undefined} readOnly={!onUpdateData} /></li>)}
                </ul>
                {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, shadows: [...(prev.designTokens.shadows || []), "shadow-new"] } } : prev)} className="no-print mt-2 text-[10px] font-bold text-purple-300 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">+ Adicionar</button>}
              </div>
            )}
            {data.designTokens.breakpoints && data.designTokens.breakpoints.length > 0 && (
              <div>
                <span className="text-green-400 block mb-2">{"// Breakpoints"}</span>
                <ul className="space-y-1">
                  {data.designTokens.breakpoints.map((t, i) => <li key={i} className="group/item"><EditableField value={t} onSave={(val) => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, breakpoints: (prev.designTokens.breakpoints || []).map((item, idx) => idx === i ? val : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, breakpoints: (prev.designTokens.breakpoints || []).filter((_, idx) => idx !== i) } } : prev) : undefined} readOnly={!onUpdateData} /></li>)}
                </ul>
                {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, breakpoints: [...(prev.designTokens.breakpoints || []), "bp-new"] } } : prev)} className="no-print mt-2 text-[10px] font-bold text-green-300 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">+ Adicionar</button>}
              </div>
            )}
            {data.designTokens.grid && (
              <div>
                <span className="text-yellow-400 block mb-2">{"// Grid System"}</span>
                <EditableField value={data.designTokens.grid} onSave={(val) => onUpdateData?.(prev => prev.designTokens ? { ...prev, designTokens: { ...prev.designTokens, grid: val } } : prev)} className="text-gray-300" readOnly={!onUpdateData} multiline />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
