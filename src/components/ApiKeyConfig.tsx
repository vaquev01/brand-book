"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";

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
  recraft: string;
  flux: string;
  recraftModel: string;
}

export const EMPTY_KEYS: ApiKeys = {
  openai: "", stability: "", ideogram: "", google: "",
  openaiTextModel: "", openaiImageModel: "",
  googleTextModel: "", googleImageModel: "",
  stabilityModel: "", ideogramModel: "",
  recraft: "", flux: "", recraftModel: "",
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
  recraft: "bb_recraft_key",
  flux: "bb_flux_key",
  recraftModel: "bb_recraft_model",
};

function normalizeGoogleModel(val: string | undefined): string {
  const trimmed = val?.trim() ?? "";
  return trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed;
}

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return { ...EMPTY_KEYS };
  const keys = Object.fromEntries(
    (Object.keys(LS) as (keyof ApiKeys)[]).map((k) => [k, localStorage.getItem(LS[k]) ?? ""])
  ) as unknown as ApiKeys;

  keys.googleTextModel = normalizeGoogleModel(keys.googleTextModel);
  keys.googleImageModel = normalizeGoogleModel(keys.googleImageModel);

  return keys;
}

export function saveApiKeys(keys: ApiKeys) {
  if (typeof window === "undefined") return;
  const next = { ...keys };
  next.googleTextModel = normalizeGoogleModel(next.googleTextModel);
  next.googleImageModel = normalizeGoogleModel(next.googleImageModel);

  (Object.keys(LS) as (keyof ApiKeys)[]).forEach((k) => {
    if (next[k]) localStorage.setItem(LS[k], next[k]);
    else localStorage.removeItem(LS[k]);
  });

  // Persist to server (fire-and-forget)
  syncKeysToServer(next).catch(() => {});
}

/** Load keys from server (database) and merge with localStorage. Server wins for keys. */
export async function loadApiKeysFromServer(): Promise<ApiKeys | null> {
  try {
    const res = await fetch("/api/user/api-keys");
    if (!res.ok) return null;
    const data = await res.json() as { keys: Record<string, string> | null };
    if (!data.keys) return null;
    const serverKeys = { ...EMPTY_KEYS } as ApiKeys;
    for (const k of Object.keys(LS) as (keyof ApiKeys)[]) {
      if (data.keys[k]) serverKeys[k] = data.keys[k];
    }
    serverKeys.googleTextModel = normalizeGoogleModel(serverKeys.googleTextModel);
    serverKeys.googleImageModel = normalizeGoogleModel(serverKeys.googleImageModel);
    return serverKeys;
  } catch {
    return null;
  }
}

async function syncKeysToServer(keys: ApiKeys): Promise<void> {
  const payload = Object.fromEntries(
    (Object.keys(LS) as (keyof ApiKeys)[]).map((k) => [k, keys[k]])
  );
  await fetch("/api/user/api-keys", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys: payload }),
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
  },
];

interface FetchedModels {
  textModels: string[];
  imageModels: string[];
}

type FetchStatus = "idle" | "loading" | "done" | "error";

function ModelSelector({
  label, value, options, onChange, loading,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  loading: boolean;
}) {
  const hasOptions = options.length > 0;
  const valueInList = options.includes(value);
  const allOptions = value && !valueInList ? [value, ...options] : options;

  return (
    <div>
      <label className="text-[11px] font-semibold opacity-70 block mb-1">{label}</label>
      {loading ? (
        <div className="w-full bg-white/60 border border-black/10 rounded-lg px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Carregando modelos...
        </div>
      ) : hasOptions ? (
        <>
          <select
            aria-label={label}
            value={allOptions.includes(value) ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer mb-1.5"
          >
            <option value="">— selecionar modelo —</option>
            {options.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ou digite um modelo personalizado"
            className="w-full bg-white/60 border border-black/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
            spellCheck={false}
          />
          <p className="text-[10px] text-gray-400 mt-1">{options.length} modelos disponíveis</p>
        </>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: gemini-2.0-flash-lite"
          className="w-full bg-white/80 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          spellCheck={false}
        />
      )}
    </div>
  );
}

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
  const lastAutoFetchedKeyRef = useRef<Record<string, string>>({});
  const autoFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          if (providerKey === "google") {
            const order = [
              "imagen-3.0-generate-002",
              "imagen-3.0-generate-001",
              "gemini-3.1-flash-image-preview",
              "gemini-3-pro-image-preview",
              "gemini-2.5-flash-image",
            ];
            next[p.imageModelKey] = order.find((m) => data.imageModels.includes(m)) ?? data.imageModels[0];
          } else {
            next[p.imageModelKey] = data.imageModels[0];
          }
        }
        return next;
      });
    } catch (e: unknown) {
      setFetchStatus((prev) => ({ ...prev, [providerKey]: "error" }));
      setFetchError((prev) => ({ ...prev, [providerKey]: e instanceof Error ? e.message : "Erro" }));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    lastAutoFetchedKeyRef.current = {};
    if (autoFetchTimerRef.current) clearTimeout(autoFetchTimerRef.current);

    // Load from localStorage first, then merge server keys (server wins)
    const localKeys = loadApiKeys();
    setKeys(localKeys);
    setSaved(false);
    setFetchedModels({});
    setFetchStatus({});
    setFetchError({});

    // Auto-fetch models for locally loaded keys
    const autoFetchForKeys = (loaded: ApiKeys) => {
      PROVIDERS.forEach((p) => {
        const key = loaded[p.key]?.trim();
        if (key) {
          setTimeout(() => {
            lastAutoFetchedKeyRef.current[p.key] = key;
            fetchModels(p.key, key);
          }, 300);
        }
      });
    };

    autoFetchForKeys(localKeys);

    // Try to load from server and merge (server keys win for non-empty values)
    loadApiKeysFromServer().then((serverKeys) => {
      if (!serverKeys) return;
      setKeys((prev) => {
        const merged = { ...prev };
        let changed = false;
        for (const k of Object.keys(LS) as (keyof ApiKeys)[]) {
          if (serverKeys[k] && serverKeys[k] !== prev[k]) {
            merged[k] = serverKeys[k];
            changed = true;
          }
        }
        if (changed) {
          // Save merged keys to localStorage
          (Object.keys(LS) as (keyof ApiKeys)[]).forEach((k) => {
            if (merged[k]) localStorage.setItem(LS[k], merged[k]);
            else localStorage.removeItem(LS[k]);
          });
          // Fetch models for any new server-provided keys
          PROVIDERS.forEach((p) => {
            const key = merged[p.key]?.trim();
            if (key && key !== lastAutoFetchedKeyRef.current[p.key]) {
              lastAutoFetchedKeyRef.current[p.key] = key;
              fetchModels(p.key, key);
            }
          });
        }
        return changed ? merged : prev;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
              Salvas <strong>no navegador</strong>. Insira a chave e clique <strong>Buscar modelos</strong>.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition ml-4 mt-0.5" aria-label="Fechar"><X className="w-5 h-5" /></button>
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
                      className="text-gray-400 hover:text-gray-700 px-1 py-1 rounded transition" aria-label={visible[p.key] ? "Ocultar chave" : "Mostrar chave"}>
                      {visible[p.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {keyVal && (
                      <button type="button" onClick={() => setKeys((prev) => ({ ...prev, [p.key]: "" }))}
                        className="text-red-400 hover:text-red-600 px-1 py-1 rounded transition" aria-label="Remover chave"><X className="w-3.5 h-3.5" /></button>
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
                {keyVal.trim() && (p.textModelKey || p.imageModelKey) && (
                  <div className="space-y-3">
                    {p.textModelKey && (
                      <ModelSelector
                        label="Modelo de Texto (Brandbook)"
                        value={keys[p.textModelKey]}
                        options={models?.textModels ?? []}
                        onChange={(v) => setKeys((prev) => ({ ...prev, [p.textModelKey!]: v }))}
                        loading={status === "loading"}
                      />
                    )}
                    {p.imageModelKey && (
                      <ModelSelector
                        label="Modelo de Imagem"
                        value={keys[p.imageModelKey]}
                        options={models?.imageModels ?? []}
                        onChange={(v) => setKeys((prev) => ({ ...prev, [p.imageModelKey!]: v }))}
                        loading={status === "loading"}
                      />
                    )}
                  </div>
                )}

                {/* Show selected models if already saved */}
              </div>
            );
          })}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Segurança:</strong> Chaves salvas no seu perfil (criptografadas) e no <code>localStorage</code>. Sincronizadas entre dispositivos.
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
