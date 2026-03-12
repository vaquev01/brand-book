"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface IconResult {
  id: string;
  prefix: string;
  name: string;
  svg: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (svg: string, source: string) => void;
  brandColor?: string;
  initialQuery?: string;
}

export function IconSwapModal({ open, onClose, onSelect, brandColor, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<IconResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<IconResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setResults([]);
      setSelected(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, initialQuery]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, limit: "16" });
      if (brandColor) params.set("color", brandColor);
      const res = await fetch(`/api/icons/search?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!controller.signal.aborted) setResults(data.icons ?? []);
    } catch {
      if (!controller.signal.aborted) setResults([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [brandColor]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-gray-900">Trocar Ícone</h3>
            <button type="button" onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-900">
              Fechar
            </button>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ícone (ex: coffee, heart, star...)"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-[10px] text-gray-400">
            200k+ ícones profissionais via Iconify (Lucide, Phosphor, Tabler, Solar, Material Design)
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && results.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8">Buscando...</div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="text-sm text-gray-400 text-center py-8">Nenhum ícone encontrado.</div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {results.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelected(icon)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition hover:bg-gray-50 ${
                    selected?.id === icon.id ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200"
                  }`}
                >
                  {icon.svg ? (
                    <div
                      className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: icon.svg }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded" />
                  )}
                  <span className="text-[9px] text-gray-500 truncate w-full text-center">{icon.name}</span>
                  <span className="text-[8px] text-gray-300">{icon.prefix}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected?.svg && (
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 shrink-0 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: selected.svg }}
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{selected.name}</div>
                <div className="text-[10px] text-gray-400">{selected.id}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selected.svg) onSelect(selected.svg, selected.id);
                onClose();
              }}
              className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition"
            >
              Usar este
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
