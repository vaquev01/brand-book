"use client";

import { Field, ArrayEditor, EmptySection, type EditorTabProps } from "./EditorFields";

export function EditorSocial({ data, onPatch }: EditorTabProps) {
  if (!data.socialMediaGuidelines) {
    return (
      <EmptySection
        label="Social Media"
        onAdd={() => onPatch({ socialMediaGuidelines: { platforms: [] } })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {data.socialMediaGuidelines.platforms.map((platform, i) => (
        <div key={i} className="app-surface-soft space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{platform.platform || `Plataforma ${i + 1}`}</h4>
            <button
              type="button"
              onClick={() => {
                const next = data.socialMediaGuidelines!.platforms.filter((_, j) => j !== i);
                onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
              }}
              className="text-xs font-medium text-gray-400 transition hover:text-red-500"
            >
              Remover
            </button>
          </div>
          <Field label="Plataforma" value={platform.platform} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], platform: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} placeholder="Ex: Instagram, LinkedIn, TikTok..." />
          <Field label="Formatos Principais" value={platform.primaryFormats} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], primaryFormats: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} placeholder="Ex: Reels, Stories, Carrossel..." />
          <Field label="Tom" value={platform.tone} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], tone: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} placeholder="Ex: Casual, Profissional..." />
          <ArrayEditor label="Pilares de Conteudo" items={platform.contentPillars} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], contentPillars: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} addLabel="Pilar" />
          <ArrayEditor label="Faca (Do)" items={platform.doList} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], doList: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} addLabel="Pratica recomendada" />
          <ArrayEditor label="Nao Faca (Don't)" items={platform.dontList} onChange={(v) => {
            const next = [...data.socialMediaGuidelines!.platforms];
            next[i] = { ...next[i], dontList: v };
            onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: next } });
          }} addLabel="Pratica a evitar" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const newPlatform = { platform: "Nova Plataforma", primaryFormats: "", tone: "", contentPillars: [], doList: [], dontList: [] };
          onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, platforms: [...data.socialMediaGuidelines!.platforms, newPlatform] } });
        }}
        className="app-surface-soft w-full border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-gray-500 transition hover:border-slate-500 hover:text-gray-700"
      >
        + Adicionar Plataforma
      </button>
      <div className="border-t border-slate-200/80 pt-4 space-y-4">
        <Field label="Estrategia Global de Hashtags" value={data.socialMediaGuidelines.globalHashtagStrategy ?? ""} onChange={(v) => onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, globalHashtagStrategy: v || undefined } })} multiline rows={2} />
        <Field label="Adaptacao da Voz por Canal" value={data.socialMediaGuidelines.brandVoiceAdaptation ?? ""} onChange={(v) => onPatch({ socialMediaGuidelines: { ...data.socialMediaGuidelines!, brandVoiceAdaptation: v || undefined } })} multiline rows={2} />
      </div>
    </div>
  );
}
