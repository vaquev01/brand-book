"use client";

import { Field, type EditorTabProps } from "./EditorFields";

export function EditorApplications({ data, onPatch }: EditorTabProps) {
  return (
    <div className="space-y-4">
      {data.applications.map((app, i) => (
        <div key={i} className="app-surface-soft space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Aplicacao {i + 1}</h4>
            <button
              type="button"
              onClick={() => onPatch({ applications: data.applications.filter((_, j) => j !== i) })}
              className="text-xs font-medium text-gray-400 transition hover:text-red-500"
            >
              Remover
            </button>
          </div>
          <Field label="Tipo" value={app.type} onChange={(v) => {
            const next = [...data.applications];
            next[i] = { ...next[i], type: v };
            onPatch({ applications: next });
          }} placeholder="Ex: Cartao de Visita, Post Instagram..." />
          <Field label="Descricao" value={app.description} onChange={(v) => {
            const next = [...data.applications];
            next[i] = { ...next[i], description: v };
            onPatch({ applications: next });
          }} multiline rows={2} />
          <Field label="Image Placeholder URL" value={app.imagePlaceholder} onChange={(v) => {
            const next = [...data.applications];
            next[i] = { ...next[i], imagePlaceholder: v };
            onPatch({ applications: next });
          }} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onPatch({ applications: [...data.applications, { type: "Nova Aplicacao", description: "", imagePlaceholder: "https://placehold.co/800x600/cccccc/666666?text=Nova+Aplicacao" }] })}
        className="app-surface-soft w-full border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-gray-500 transition hover:border-slate-500 hover:text-gray-700"
      >
        + Adicionar Aplicacao
      </button>
    </div>
  );
}
