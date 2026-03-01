"use client";

import { useState, useEffect } from "react";

export interface ApiKeys {
  openai: string;
  stability: string;
  ideogram: string;
}

const LS_KEYS = {
  openai: "bb_openai_key",
  stability: "bb_stability_key",
  ideogram: "bb_ideogram_key",
} as const;

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return { openai: "", stability: "", ideogram: "" };
  return {
    openai: localStorage.getItem(LS_KEYS.openai) ?? "",
    stability: localStorage.getItem(LS_KEYS.stability) ?? "",
    ideogram: localStorage.getItem(LS_KEYS.ideogram) ?? "",
  };
}

export function saveApiKeys(keys: ApiKeys) {
  if (typeof window === "undefined") return;
  if (keys.openai) localStorage.setItem(LS_KEYS.openai, keys.openai);
  else localStorage.removeItem(LS_KEYS.openai);
  if (keys.stability) localStorage.setItem(LS_KEYS.stability, keys.stability);
  else localStorage.removeItem(LS_KEYS.stability);
  if (keys.ideogram) localStorage.setItem(LS_KEYS.ideogram, keys.ideogram);
  else localStorage.removeItem(LS_KEYS.ideogram);
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

const PROVIDER_INFO = [
  {
    key: "openai" as const,
    name: "OpenAI",
    label: "OPENAI_API_KEY",
    description: "GPT-4o (geração de brandbook) + DALL-E 3 (imagens)",
    placeholder: "sk-proj-...",
    link: "https://platform.openai.com/api-keys",
    color: "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-500",
    required: true,
  },
  {
    key: "stability" as const,
    name: "Stability AI",
    label: "STABILITY_API_KEY",
    description: "Stable Diffusion XL — texturas, padrões e fotografia",
    placeholder: "sk-...",
    link: "https://platform.stability.ai/account/keys",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
    required: false,
  },
  {
    key: "ideogram" as const,
    name: "Ideogram",
    label: "IDEOGRAM_API_KEY",
    description: "Ideogram V2 — logos com texto e design gráfico",
    placeholder: "ideogram-...",
    link: "https://ideogram.ai/manage-api",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
    required: false,
  },
];

export function ApiKeyConfig({ isOpen, onClose, onSave }: Props) {
  const [keys, setKeys] = useState<ApiKeys>({ openai: "", stability: "", ideogram: "" });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(loadApiKeys());
      setSaved(false);
    }
  }, [isOpen]);

  function handleSave() {
    saveApiKeys(keys);
    onSave(keys);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }

  function toggleVisible(k: string) {
    setVisible((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  function maskKey(val: string): string {
    if (!val) return "";
    if (val.length <= 8) return "•".repeat(val.length);
    return val.slice(0, 4) + "•".repeat(Math.min(val.length - 8, 20)) + val.slice(-4);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Configurar APIs</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Suas chaves são salvas <strong>apenas no seu navegador</strong> (localStorage). Nunca são enviadas a terceiros.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4 mt-0.5"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {PROVIDER_INFO.map((p) => {
            const val = keys[p.key];
            const isSet = val.length > 0;
            return (
              <div key={p.key} className={`rounded-xl border p-4 ${p.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSet ? p.dot : "bg-gray-300"}`} />
                    <span className="font-bold text-sm">{p.name}</span>
                    {p.required && (
                      <span className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Obrigatória
                      </span>
                    )}
                    {!p.required && (
                      <span className="text-[10px] font-semibold bg-black/5 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Opcional
                      </span>
                    )}
                  </div>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Obter chave ↗
                  </a>
                </div>
                <p className="text-xs opacity-75 mb-3">{p.description}</p>
                <div className="relative">
                  <input
                    type={visible[p.key] ? "text" : "password"}
                    value={val}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [p.key]: e.target.value }))}
                    placeholder={isSet ? maskKey(loadApiKeys()[p.key]) : p.placeholder}
                    className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2.5 pr-20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/20 placeholder:text-gray-400"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVisible(p.key)}
                      className="text-xs text-gray-500 hover:text-gray-900 px-1.5 py-1 rounded"
                      title={visible[p.key] ? "Ocultar" : "Mostrar"}
                    >
                      {visible[p.key] ? "●" : "○"}
                    </button>
                    {val && (
                      <button
                        type="button"
                        onClick={() => setKeys((prev) => ({ ...prev, [p.key]: "" }))}
                        className="text-xs text-red-500 hover:text-red-700 px-1.5 py-1 rounded"
                        title="Limpar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] opacity-60 mt-1.5 font-mono">{p.label}</p>
              </div>
            );
          })}

          {/* Security notice */}
          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              🔒 <strong>Segurança:</strong> As chaves são armazenadas no <code>localStorage</code> do seu navegador e enviadas
              diretamente para as APIs dos provedores via requisições server-side no Next.js. Nenhum dado é
              armazenado em servidor externo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 max-w-xs py-2.5 px-6 rounded-xl text-sm font-bold transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {saved ? "✓ Salvo!" : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApiKeyStatusBadge({ keys }: { keys: ApiKeys }) {
  const hasOpenai = !!keys.openai;
  const hasAny = hasOpenai || !!keys.stability || !!keys.ideogram;
  const count = [keys.openai, keys.stability, keys.ideogram].filter(Boolean).length;

  if (!hasAny) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        APIs não configuradas
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      {count}/3 {count === 1 ? "chave" : "chaves"} configurada{count > 1 ? "s" : ""}
    </span>
  );
}
