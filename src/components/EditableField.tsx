import { useState } from "react";

interface Props {
  value: string;
  onSave: (val: string) => void;
  onDelete?: () => void;
  multiline?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function EditableField({ value, onSave, onDelete, multiline, className = "", readOnly }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (readOnly) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 relative z-10">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${className}`}
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`w-full bg-white border rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${className}`}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => { onSave(draft); setIsEditing(false); }} className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
          <button type="button" onClick={() => { setIsEditing(false); setDraft(value); }} className="text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 transition">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={className}>{value}</div>
      <div className="absolute -top-3 -right-3 no-print flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => { setDraft(value); setIsEditing(true); }}
          className="w-6 h-6 bg-white border shadow-sm flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition"
          title="Editar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-6 h-6 bg-white border shadow-sm flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Excluir"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
