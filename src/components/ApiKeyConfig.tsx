"use client";

import { useState, useEffect, useCallback } from "react";

export interface ApiKeys {
  openai: string;
  stability: string;
  ideogram: string;
  google: string;
  openaiTextModel: string;
  openaiImageModel: string;
  googleTextModel: string;
  googleImageModel: string;
  stabilityModel: string;
  ideogramModel: string;
}

export const EMPTY_KEYS: ApiKeys = {
  openai: "", stability: "", ideogram: "", google: "",
  openaiTextModel: "", openaiImageModel: "",
  googleTextModel: "", googleImageModel: "",
  stabilityModel: "", ideogramModel: "",
};

const LS: Record<keyof ApiKeys, string> = {
  openai: "bb_openai_key",
  stability: "bb_stability_key",
  ideogram: "bb_ideogram_key",
  google: "bb_google_key",
  openaiTextModel: "bb_openai_text_model",
  openaiImageModel: "bb_openai_image_model",
  googleTextModel: "bb_google_text_model",
  googleImageModel: "bb_google_image_model",
  stabilityModel: "bb_stability_model",
  ideogramModel: "bb_ideogram_model",
};

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return { ...EMPTY_KEYS };
  const keys = Object.fromEntries(
    (Object.keys(LS) as (keyof ApiKeys)[]).map((k) => [k, localStorage.getItem(LS[k]) ?? ""])
  ) as unknown as ApiKeys;

  if (keys.googleTextModel?.trim() === "gemini-2.0-flash" || keys.googleTextModel?.trim() === "models/gemini-2.0-flash") {
    keys.googleTextModel = "gemini-1.5-flash";
  }

  return keys;
}

export function saveApiKeys(keys: ApiKeys) {
  if (typeof window === "undefined") return;
  const next = { ...keys };
  if (next.googleTextModel?.trim() === "gemini-2.0-flash" || next.googleTextModel?.trim() === "models/gemini-2.0-flash") {
    next.googleTextModel = "gemini-1.5-flash";
  }
  (Object.keys(LS) as (keyof ApiKeys)[]).forEach((k) => {
    if (next[k]) localStorage.setItem(LS[k], next[k]);
    else localStorage.removeItem(LS[k]);
  });
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

interface ProviderConfig {
  key: "openai" | "stability" | "ideogram" | "google";
  name: string;
  label: string;
  placeholder: string;
  link: string;
  color: string;
  dot: string;
  required: boolean;
  textModelKey?: keyof ApiKeys;
  imageModelKey?: keyof ApiKeys;
  comingSoon?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    key: "openai",
    name: "OpenAI",
    label: "OPENAI_API_KEY",
    placeholder: "sk-proj-...",
    link: "https://platform.openai.com/api-keys",
    color: "text-green-700 bg-green-50 border-green-200",
    dot: "bg-green-500",
    required: true,
    textModelKey: "openaiTextModel",
    imageModelKey: "openaiImageModel",
  },
  {
    key: "google",
    name: "Google AI",
    label: "GOOGLE_API_KEY",
    placeholder: "AIza...",
    link: "https://aistudio.google.com/app/apikey",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    required: false,
    textModelKey: "googleTextModel",
    imageModelKey: "googleImageModel",
  },
  {
    key: "stability",
    name: "Stability AI",
    label: "STABILITY_API_KEY",
    placeholder: "sk-...",
    link: "https://platform.stability.ai/account/keys",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
    required: false,
    imageModelKey: "stabilityModel",
    comingSoon: true,
  },
  {
    key: "ideogram",
    name: "Ideogram",
    label: "IDEOGRAM_API_KEY",
    placeholder: "ideogram-...",
    link: "https://ideogram.ai/manage-api",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
    required: false,
    imageModelKey: "ideogramModel",
    comingSoon: true,
  },
];

interface FetchedModels {
  textModels: string[];
  imageModels: string[];
}

type FetchStatus = "idle" | "loading" | "done" | "error";

function maskKey(val: string): string {
  if (!val) return "";
  if (val.length <= 8) return "•".repeat(val.length);
  return val.slice(0, 4) + "•".repeat(Math.min(val.length - 8, 20)) + val.slice(-4);
}

export function ApiKeyConfig({ isOpen, onClose, onSave }: Props) {
  const [keys, setKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<Record<string, FetchedModels>>({});
  const [fetchStatus, setFetchStatus] = useState<Record<string, FetchStatus>>({});
  const [fetchError, setFetchError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setKeys(loadApiKeys());
      setSaved(false);
      setFetchedModels({});
      setFetchStatus({});
      setFetchError({});
    }
  }, [isOpen]);

  const fetchModels = useCallback(async (providerKey: string, apiKey: string) => {
    if (!apiKey.trim()) return;
    setFetchStatus((prev) => ({ ...prev, [providerKey]: "loading" }));
    setFetchError((prev) => ({ ...prev, [providerKey]: "" }));
    try {
      const res = await fetch("/api/provider-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerKey, apiKey: apiKey.trim() }),
      });
      const data = await res.json() as FetchedModels & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro ao buscar modelos");
      setFetchedModels((prev) => ({ ...prev, [providerKey]: data }));
      setFetchStatus((prev) => ({ ...prev, [providerKey]: "done" }));
      setKeys((prev) => {
        const p = PROVIDERS.find((p) => p.key === providerKey);
        if (!p) return prev;
        const next = { ...prev };
        if (p.textModelKey && !prev[p.textModelKey] && data.textModels?.[0]) {
          const preferred = data.textModels.find((m) => !m.toLowerCase().includes("image")) ?? data.textModels[0];
          next[p.textModelKey] = preferred;
        }
        if (p.imageModelKey && !prev[p.imageModelKey] && data.imageModels?.[0]) {
          next[p.imageModelKey] = data.imageModels[0];
        }
        return next;
      });
    } catch (e: unknown) {
      setFetchStatus((prev) => ({ ...prev, [providerKey]: "error" }));
      setFetchError((prev) => ({ ...prev, [providerKey]: e instanceof Error ? e.message : "Erro" }));
    }
  }, []);

  function handleSave() {
    saveApiKeys(keys);
    onSave(keys);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Configurar APIs</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Chaves salvas <strong>apenas no seu navegador</strong>. Após inserir a chave, clique em{" "}
              <strong>Buscar modelos</strong> para ver os modelos disponíveis.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4 mt-0.5">&times;</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {PROVIDERS.map((p) => {
            const keyVal = keys[p.key];
            const isSet = keyVal.length > 0;
            const status = fetchStatus[p.key] ?? "idle";
            const models = fetchedModels[p.key];
            const errMsg = fetchError[p.key];
            return (
              <div key={p.key} className={`rounded-xl border p-4 ${p.color}`}>
                {/* Title row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSet ? p.dot : "bg-gray-300"}`} />
                    <span className="font-bold text-sm">{p.name}</span>
                    {p.comingSoon ? (
                      <span className="text-[10px] font-bold bg-black/10 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Em breve
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold bg-black/${p.required ? 10 : 5} px-1.5 py-0.5 rounded uppercase tracking-wide`}>
                        {p.required ? "Obrigatória" : "Opcional"}
                      </span>
                    )}
                  </div>
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}>Obter chave ↗</a>
                </div>

                {/* Key input */}
                <div className="relative mb-2">
                  <input
                    type={visible[p.key] ? "text" : "password"}
                    value={keyVal}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [p.key]: e.target.value }))}
                    placeholder={isSet ? maskKey(loadApiKeys()[p.key]) : p.placeholder}
                    className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2.5 pr-20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/20 placeholder:text-gray-400"
                    autoComplete="off" spellCheck={false}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button type="button" onClick={() => setVisible((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                      className="text-xs text-gray-500 hover:text-gray-900 px-1.5 py-1 rounded">
                      {visible[p.key] ? "●" : "○"}
                    </button>
                    {keyVal && (
                      <button type="button" onClick={() => setKeys((prev) => ({ ...prev, [p.key]: "" }))}
                        className="text-xs text-red-500 hover:text-red-700 px-1.5 py-1 rounded">✕</button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] opacity-60 font-mono mb-3">{p.label}</p>

                {/* Fetch models button */}
                {keyVal.trim() && (
                  <button
                    type="button"
                    onClick={() => fetchModels(p.key, keyVal)}
                    disabled={status === "loading"}
                    className="mb-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {status === "loading" && (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {status === "loading" ? "Buscando modelos..." : status === "done" ? "↺ Atualizar modelos" : "Buscar modelos disponíveis"}
                  </button>
                )}

                {/* Error */}
                {status === "error" && errMsg && (
                  <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mb-3">{errMsg}</p>
                )}

                {/* Model selectors */}
                {models && (
                  <div className="space-y-2">
                    {p.textModelKey && models.textModels.length > 0 && (
                      <div>
                        <label className="text-[11px] font-semibold opacity-70 block mb-1">Modelo de Texto (Brandbook)</label>
                        <select
                          aria-label="Modelo de Texto"
                          value={keys[p.textModelKey]}
                          onChange={(e) => setKeys((prev) => ({ ...prev, [p.textModelKey!]: e.target.value }))}
                          className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                        >
                          {models.textModels.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {p.imageModelKey && models.imageModels.length > 0 && (
                      <div>
                        <label className="text-[11px] font-semibold opacity-70 block mb-1">Modelo de Imagem</label>
                        <select
                          aria-label="Modelo de Imagem"
                          value={keys[p.imageModelKey]}
                          onChange={(e) => setKeys((prev) => ({ ...prev, [p.imageModelKey!]: e.target.value }))}
                          className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                        >
                          {models.imageModels.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Show selected models if already saved */}
                {!models && (keys[p.textModelKey as keyof ApiKeys] || keys[p.imageModelKey as keyof ApiKeys]) && (
                  <div className="text-[11px] opacity-60 space-y-0.5">
                    {p.textModelKey && keys[p.textModelKey] && <p>Texto: <code>{keys[p.textModelKey]}</code></p>}
                    {p.imageModelKey && keys[p.imageModelKey] && <p>Imagem: <code>{keys[p.imageModelKey]}</code></p>}
                  </div>
                )}
              </div>
            );
          })}

          <div className="bg-gray-50 border rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              🔒 <strong>Segurança:</strong> Chaves armazenadas no <code>localStorage</code> do seu navegador e enviadas
              via requisições server-side do Next.js. Nenhum dado armazenado em servidor externo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl flex items-center justify-between gap-3">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
          <button
            onClick={handleSave}
            className={`flex-1 max-w-xs py-2.5 px-6 rounded-xl text-sm font-bold transition-all ${
              saved ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
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
  const hasGoogle = !!keys.google;
  const hasAny = hasOpenai || hasGoogle;
  const count = [keys.openai, keys.google].filter(Boolean).length;

  if (!hasAny) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Configure uma API para gerar
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      {count === 2 ? "OpenAI + Google" : hasOpenai ? "OpenAI" : "Google AI"} configurado
    </span>
  );
}
