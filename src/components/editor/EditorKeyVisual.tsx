"use client";

import { Mascot } from "@/lib/types";
import { Field, ArrayEditor, MascotEditorCard, type EditorTabProps } from "./EditorFields";

export function EditorKeyVisual({ data, onPatch }: EditorTabProps) {
  function addNewMascot() {
    const newMascot: Mascot = {
      name: "Novo Mascote",
      description: "",
      personality: "",
      usageGuidelines: [],
    };
    onPatch({
      keyVisual: {
        ...data.keyVisual,
        mascots: [...(data.keyVisual.mascots ?? []), newMascot],
      },
    });
  }

  return (
    <>
      <ArrayEditor label="Elementos Graficos" items={data.keyVisual.elements} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, elements: v } })} addLabel="Elemento grafico" />
      <Field label="Estilo Fotografico" value={data.keyVisual.photographyStyle} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, photographyStyle: v } })} multiline rows={2} />
      <Field label="Iconografia" value={data.keyVisual.iconography ?? ""} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, iconography: v } })} multiline rows={2} />
      <Field label="Ilustracoes" value={data.keyVisual.illustrations ?? ""} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, illustrations: v } })} multiline rows={2} />
      <Field label="Arquitetura de Marketing" value={data.keyVisual.marketingArchitecture ?? ""} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, marketingArchitecture: v } })} multiline rows={2} />
      <ArrayEditor label="Simbolos Identitarios" items={data.keyVisual.symbols ?? []} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, symbols: v } })} addLabel="Simbolo" />
      <ArrayEditor label="Padroes Graficos" items={data.keyVisual.patterns ?? []} onChange={(v) => onPatch({ keyVisual: { ...data.keyVisual, patterns: v } })} addLabel="Padrao grafico" />

      <div className="border-t border-slate-200/80 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-700">Mascotes &amp; Personagens</h4>
          <button type="button" onClick={addNewMascot} className="app-primary-button px-3 py-2 text-xs">
            + Novo Mascote
          </button>
        </div>
        {(data.keyVisual.mascots ?? []).length === 0 && (
          <div className="app-surface-soft border-2 border-dashed border-slate-200 py-8 text-center text-gray-400">
            <div className="mb-2 text-3xl">&#x1f43e;</div>
            <p className="text-sm font-medium">Nenhum mascote definido</p>
            <p className="mt-1 text-xs">Adicione um personagem a marca</p>
          </div>
        )}
        <div className="space-y-4">
          {(data.keyVisual.mascots ?? []).map((mascot, i) => (
            <MascotEditorCard
              key={i}
              mascot={mascot}
              index={i}
              onChange={(m) => {
                const next = [...(data.keyVisual.mascots ?? [])];
                next[i] = m;
                onPatch({ keyVisual: { ...data.keyVisual, mascots: next } });
              }}
              onRemove={() => {
                const next = (data.keyVisual.mascots ?? []).filter((_, j) => j !== i);
                onPatch({ keyVisual: { ...data.keyVisual, mascots: next } });
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
