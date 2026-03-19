"use client";

import { Field, ArrayEditor, type EditorTabProps } from "./EditorFields";

export function EditorLogo({ data, onPatch }: EditorTabProps) {
  return (
    <>
      <Field label="Logo Primario (URL)" value={data.logo.primary} onChange={(v) => onPatch({ logo: { ...data.logo, primary: v } })} placeholder="https://placehold.co/800x200/..." />
      <Field label="Logo Secundario (URL)" value={data.logo.secondary} onChange={(v) => onPatch({ logo: { ...data.logo, secondary: v } })} placeholder="https://placehold.co/..." />
      <Field label="Simbolo / Icone (URL)" value={data.logo.symbol} onChange={(v) => onPatch({ logo: { ...data.logo, symbol: v } })} placeholder="https://placehold.co/..." />
      <Field label="Favicon / App Icon" value={data.logo.favicon ?? ""} onChange={(v) => onPatch({ logo: { ...data.logo, favicon: v } })} />
      <Field label="Clear Space" value={data.logo.clearSpace} onChange={(v) => onPatch({ logo: { ...data.logo, clearSpace: v } })} />
      <Field label="Tamanho Minimo" value={data.logo.minimumSize} onChange={(v) => onPatch({ logo: { ...data.logo, minimumSize: v } })} />
      <ArrayEditor label="Usos Incorretos" items={data.logo.incorrectUsages} onChange={(v) => onPatch({ logo: { ...data.logo, incorrectUsages: v } })} addLabel="Uso incorreto" />
      {data.logoVariants && (
        <div className="border-t border-slate-200/80 pt-4">
          <h4 className="mb-4 text-sm font-bold text-gray-700">Variacoes de Logo (URLs)</h4>
          <div className="space-y-3">
            {(["horizontal", "stacked", "mono", "negative", "markOnly", "wordmarkOnly"] as const).map((key) => (
              <Field key={key} label={key} value={data.logoVariants?.[key] ?? ""} onChange={(v) => onPatch({ logoVariants: { ...data.logoVariants, [key]: v } })} placeholder="https://placehold.co/..." />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
