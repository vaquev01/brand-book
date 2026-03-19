"use client";

import { Field, ArrayEditor, type EditorTabProps } from "./EditorFields";

export function EditorDNA({ data, onPatch }: EditorTabProps) {
  return (
    <>
      <Field label="Nome da Marca" value={data.brandName} onChange={(v) => onPatch({ brandName: v })} />
      <Field label="Industria / Nicho" value={data.industry} onChange={(v) => onPatch({ industry: v })} />
      <div className="border-t border-slate-200/80 pt-4">
        <h4 className="mb-4 text-sm font-bold text-gray-700">Brand Concept</h4>
        <div className="space-y-4">
          <Field label="Proposito" value={data.brandConcept.purpose} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, purpose: v } })} multiline rows={2} />
          <Field label="Missao" value={data.brandConcept.mission} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, mission: v } })} multiline rows={2} />
          <Field label="Visao" value={data.brandConcept.vision} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, vision: v } })} multiline rows={2} />
          <Field label="Proposta Unica de Valor (UVP)" value={data.brandConcept.uniqueValueProposition ?? ""} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, uniqueValueProposition: v } })} multiline rows={2} />
          <Field label="Tom de Voz" value={data.brandConcept.toneOfVoice} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, toneOfVoice: v } })} multiline rows={2} />
          <Field label="Psicografia do Usuario" value={data.brandConcept.userPsychographics ?? ""} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, userPsychographics: v } })} multiline rows={2} />
          <ArrayEditor label="Valores" items={data.brandConcept.values} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, values: v } })} addLabel="Valor" />
          <ArrayEditor label="Personalidade" items={data.brandConcept.personality} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, personality: v } })} addLabel="Traco de personalidade" />
          <ArrayEditor label="Reasons to Believe" items={data.brandConcept.reasonsToBelieve ?? []} onChange={(v) => onPatch({ brandConcept: { ...data.brandConcept, reasonsToBelieve: v } })} addLabel="RTB" />
        </div>
      </div>
    </>
  );
}
