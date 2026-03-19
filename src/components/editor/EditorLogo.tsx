"use client";

import { Field, ArrayEditor, type EditorTabProps } from "./EditorFields";

export function EditorLogo({ data, onPatch }: EditorTabProps) {
  return (
    <>
      <Field
        label="Conceito do Simbolo (Symbol Concept)"
        value={data.logo.symbolConcept ?? ""}
        onChange={(v) => onPatch({ logo: { ...data.logo, symbolConcept: v } })}
        multiline
        rows={6}
        placeholder="Descricao detalhada do conceito visual do mark: forma, metafora, tecnica de construcao, significado..."
      />
      <Field label="Logo Primario (URL)" value={data.logo.primary} onChange={(v) => onPatch({ logo: { ...data.logo, primary: v } })} placeholder="https://placehold.co/800x200/..." />
      <Field label="Logo Secundario (URL)" value={data.logo.secondary} onChange={(v) => onPatch({ logo: { ...data.logo, secondary: v } })} placeholder="https://placehold.co/..." />
      <Field label="Simbolo / Icone (URL)" value={data.logo.symbol} onChange={(v) => onPatch({ logo: { ...data.logo, symbol: v } })} placeholder="https://placehold.co/..." />
      <Field label="Favicon / App Icon" value={data.logo.favicon ?? ""} onChange={(v) => onPatch({ logo: { ...data.logo, favicon: v } })} />
      <Field label="Clear Space" value={data.logo.clearSpace} onChange={(v) => onPatch({ logo: { ...data.logo, clearSpace: v } })} />
      <Field label="Tamanho Minimo" value={data.logo.minimumSize} onChange={(v) => onPatch({ logo: { ...data.logo, minimumSize: v } })} />
      <ArrayEditor label="Usos Incorretos" items={data.logo.incorrectUsages} onChange={(v) => onPatch({ logo: { ...data.logo, incorrectUsages: v } })} addLabel="Uso incorreto" />
      <div className="border-t border-slate-200/80 pt-4">
        <h4 className="mb-4 text-sm font-bold text-gray-700">Analise Semiotica</h4>
        <div className="space-y-3">
          <Field
            label="Psicologia das Formas (Shape Psychology)"
            value={data.logo.shapePsychology ?? ""}
            onChange={(v) => onPatch({ logo: { ...data.logo, shapePsychology: v } })}
            multiline
            rows={3}
            placeholder="Ex: Circulos transmitem unidade e protecao; angulos agudos sugerem dinamismo..."
          />
          <Field
            label="Metafora do Espaco Negativo"
            value={data.logo.negativeSpaceMetaphor ?? ""}
            onChange={(v) => onPatch({ logo: { ...data.logo, negativeSpaceMetaphor: v } })}
            multiline
            rows={3}
            placeholder="Ex: O espaco entre as letras forma uma seta apontando para frente..."
          />
          <Field
            label="Estagio Evolutivo"
            value={data.logo.evolutionaryStage ?? ""}
            onChange={(v) => onPatch({ logo: { ...data.logo, evolutionaryStage: v as "Descriptive" | "Transitional" | "Iconic" } })}
            placeholder="Descriptive, Transitional ou Iconic"
          />
          {data.logo.semioticAnalysis && (
            <>
              <Field
                label="Natureza do Simbolo"
                value={data.logo.semioticAnalysis.natureOfSymbol ?? ""}
                onChange={(v) => onPatch({ logo: { ...data.logo, semioticAnalysis: { ...data.logo.semioticAnalysis!, natureOfSymbol: v as "Icon" | "Index" | "Symbol" } } })}
                placeholder="Icon, Index ou Symbol"
              />
              <Field
                label="Denotacao"
                value={data.logo.semioticAnalysis.denotation ?? ""}
                onChange={(v) => onPatch({ logo: { ...data.logo, semioticAnalysis: { ...data.logo.semioticAnalysis!, denotation: v } } })}
                multiline
                rows={2}
              />
              <Field
                label="Conotacao"
                value={data.logo.semioticAnalysis.connotation ?? ""}
                onChange={(v) => onPatch({ logo: { ...data.logo, semioticAnalysis: { ...data.logo.semioticAnalysis!, connotation: v } } })}
                multiline
                rows={2}
              />
            </>
          )}
        </div>
      </div>
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
