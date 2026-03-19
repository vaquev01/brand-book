"use client";

import { Field, ArrayEditor, type EditorTabProps } from "./EditorFields";

export function EditorImageBriefing({ data, onPatch }: EditorTabProps) {
  if (!data.imageGenerationBriefing) return null;

  return (
    <>
      <Field label="Estilo Visual" value={data.imageGenerationBriefing.visualStyle} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, visualStyle: v } })} multiline rows={2} />
      <Field label="Mood de Cores" value={data.imageGenerationBriefing.colorMood} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, colorMood: v } })} multiline rows={2} />
      <Field label="Notas de Composicao" value={data.imageGenerationBriefing.compositionNotes} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, compositionNotes: v } })} multiline rows={2} />
      <ArrayEditor label="Keywords de Mood" items={data.imageGenerationBriefing.moodKeywords} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, moodKeywords: v } })} addLabel="Keyword" />
      <Field label="Referencias Artisticas" value={data.imageGenerationBriefing.artisticReferences} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, artisticReferences: v } })} multiline rows={2} />
      <Field label="Elementos a Evitar" value={data.imageGenerationBriefing.avoidElements} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, avoidElements: v } })} multiline rows={2} />
      <Field label="Guia de Estilo do Logo" value={data.imageGenerationBriefing.logoStyleGuide} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, logoStyleGuide: v } })} multiline rows={2} />
      <Field label="Mood Fotografico" value={data.imageGenerationBriefing.photographyMood} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, photographyMood: v } })} multiline rows={2} />
      <Field label="Estilo de Padrao" value={data.imageGenerationBriefing.patternStyle} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, patternStyle: v } })} multiline rows={2} />
      <Field label="Linguagem Visual de Marketing" value={data.imageGenerationBriefing.marketingVisualLanguage} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, marketingVisualLanguage: v } })} multiline rows={2} />
      <Field label="Emotional Core" value={data.imageGenerationBriefing.emotionalCore ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, emotionalCore: v || undefined } })} multiline rows={2} />
      <Field label="Linguagem de Texturas" value={data.imageGenerationBriefing.textureLanguage ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, textureLanguage: v || undefined } })} multiline rows={2} />
      <Field label="Assinatura de Iluminacao" value={data.imageGenerationBriefing.lightingSignature ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, lightingSignature: v || undefined } })} multiline rows={2} />
      <Field label="Assinatura de Camera" value={data.imageGenerationBriefing.cameraSignature ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, cameraSignature: v || undefined } })} multiline rows={2} />
      <Field label="Arquetipo da Marca" value={data.imageGenerationBriefing.brandArchetype ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, brandArchetype: v || undefined } })} multiline rows={2} />
      <Field label="Perfil Sensorial" value={data.imageGenerationBriefing.sensoryProfile ?? ""} onChange={(v) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, sensoryProfile: v || undefined } })} multiline rows={2} />
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-red-500">Negative Prompt (global)</label>
        <textarea
          value={data.imageGenerationBriefing.negativePrompt}
          onChange={(e) => onPatch({ imageGenerationBriefing: { ...data.imageGenerationBriefing!, negativePrompt: e.target.value } })}
          rows={3}
          className="app-textarea border-red-200 text-sm"
        />
      </div>
    </>
  );
}
