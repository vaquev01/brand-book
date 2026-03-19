"use client";

import { Field, ArrayEditor, EmptySection, type EditorTabProps } from "./EditorFields";

export function EditorPositioning({ data, onPatch }: EditorTabProps) {
  if (!data.positioning) {
    return (
      <EmptySection
        label="Posicionamento"
        onAdd={() => onPatch({ positioning: { category: "", targetMarket: "", positioningStatement: "", primaryDifferentiators: [], competitiveAlternatives: [], reasonsToBelieve: [] } })}
      />
    );
  }

  return (
    <>
      <Field label="Categoria" value={data.positioning.category} onChange={(v) => onPatch({ positioning: { ...data.positioning!, category: v } })} />
      <Field label="Mercado-alvo" value={data.positioning.targetMarket} onChange={(v) => onPatch({ positioning: { ...data.positioning!, targetMarket: v } })} multiline />
      <Field label="Positioning Statement" value={data.positioning.positioningStatement} onChange={(v) => onPatch({ positioning: { ...data.positioning!, positioningStatement: v } })} multiline rows={3} />
      <ArrayEditor label="Diferenciais Primarios" items={data.positioning.primaryDifferentiators} onChange={(v) => onPatch({ positioning: { ...data.positioning!, primaryDifferentiators: v } })} addLabel="Diferencial" />
      <ArrayEditor label="Alternativas Competitivas" items={data.positioning.competitiveAlternatives} onChange={(v) => onPatch({ positioning: { ...data.positioning!, competitiveAlternatives: v } })} addLabel="Concorrente / alternativa" />
      <ArrayEditor label="Reasons to Believe" items={data.positioning.reasonsToBelieve} onChange={(v) => onPatch({ positioning: { ...data.positioning!, reasonsToBelieve: v } })} addLabel="RTB" />
    </>
  );
}
