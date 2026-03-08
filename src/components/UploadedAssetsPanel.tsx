"use client";

import { useRef, useState } from "react";
import { UploadedAsset } from "@/lib/types";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";

const ASSET_TYPES: { value: UploadedAsset["type"]; label: string; icon: string; description: string }[] = [
  { value: "logo", label: "Logo", icon: "🖼️", description: "Versões do logo da marca" },
  { value: "mascot", label: "Mascote", icon: "🐾", description: "Personagens e mascotes" },
  { value: "element", label: "Elemento", icon: "✦", description: "Ícones, símbolos, grafismos" },
  { value: "pattern", label: "Padrão", icon: "▦", description: "Texturas e padrões repetiveis" },
  { value: "reference", label: "Referência", icon: "📌", description: "Moodboards e referências gerais" },
  { value: "other", label: "Outro", icon: "📁", description: "Outros arquivos de marca" },
];

interface Props {
  assets: UploadedAsset[];
  onChange: (assets: UploadedAsset[]) => void;
}

export function UploadedAssetsPanel({ assets, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<UploadedAsset["type"]>("logo");
  const [filterType, setFilterType] = useState<UploadedAsset["type"] | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  async function processFiles(files: FileList) {
    setUploadError("");

    const MAX_FILES = 20;
    const MAX_IMAGE_DATAURL_CHARS = 3_500_000;
    const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024;

    const allowed = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_FILES);

    if (allowed.length === 0) return;

    const newAssets: UploadedAsset[] = [];

    for (const file of allowed) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError("Um ou mais arquivos foram ignorados por serem muito grandes (máx. 12MB cada)."
        );
        continue;
      }

      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
      const dataUrl = isSvg
        ? await rasterFileToOptimizedDataUrl(file, 1600, "image/png", 0.92)
        : await rasterFileToOptimizedDataUrl(file, 1600, "image/webp", 0.88);

      if (dataUrl.length > MAX_IMAGE_DATAURL_CHARS) {
        setUploadError("Um ou mais arquivos ficaram muito pesados. Tente versões menores."
        );
        continue;
      }

      newAssets.push({
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: uploadType,
        dataUrl,
        description: "",
      });
    }

    if (newAssets.length > 0) onChange([...assets, ...newAssets]);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    void processFiles(files);
  }

  function handleRemove(id: string) {
    onChange(assets.filter((a) => a.id !== id));
  }

  function handleUpdate(id: string, patch: Partial<UploadedAsset>) {
    onChange(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  const filtered = filterType === "all" ? assets : assets.filter((a) => a.type === filterType);

  const counts = ASSET_TYPES.reduce((acc, t) => {
    acc[t.value] = assets.filter((a) => a.type === t.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="app-shell p-5 sm:p-6">
        <h3 className="mb-4 font-bold text-gray-900">Adicionar Ativos de Marca</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {ASSET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setUploadType(t.value)}
              className={`rounded-2xl border p-3 text-center transition ${
                uploadType === t.value
                  ? "border-gray-900 bg-gray-900 text-white shadow-[0_18px_32px_-24px_rgba(15,23,42,0.45)]"
                  : "border-gray-200 bg-white/75 hover:border-gray-400 hover:bg-white"
              }`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="text-xs font-semibold">{t.label}</div>
            </button>
          ))}
        </div>
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-[1.4rem] border-2 border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 p-7 text-center transition hover:border-slate-500 hover:bg-slate-50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="text-sm font-semibold text-gray-700">
            {ASSET_TYPES.find((t) => t.value === uploadType)?.icon} Clique para fazer upload como{" "}
            <span className="underline">{ASSET_TYPES.find((t) => t.value === uploadType)?.label}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG, WEBP — múltiplos arquivos</p>
        </div>

        {uploadError && (
          <div className="app-surface-soft mt-3 rounded-lg border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-800 font-semibold">{uploadError}</p>
          </div>
        )}
      </div>

      {assets.length > 0 && (
        <div className="app-shell p-5 sm:p-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filterType === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos ({assets.length})
            </button>
            {ASSET_TYPES.filter((t) => counts[t.value] > 0).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFilterType(t.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  filterType === t.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.icon} {t.label} ({counts[t.value]})
              </button>
            ))}
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((asset) => {
              const typeInfo = ASSET_TYPES.find((t) => t.value === asset.type);
              const isEditing = editingId === asset.id;
              return (
                <div key={asset.id} className="app-surface-soft group relative overflow-hidden">
                  <div className="flex h-40 items-center justify-center border-b border-slate-200/80 bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="app-chip text-[10px] uppercase">
                        {typeInfo?.icon} {typeInfo?.label}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : asset.id)}
                          className="text-xs text-gray-400 hover:text-gray-700 transition"
                          title="Editar"
                        >
                          ✏
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(asset.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition"
                          title="Remover"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={asset.name}
                          onChange={(e) => handleUpdate(asset.id, { name: e.target.value })}
                          placeholder="Nome do ativo"
                          className="app-input text-xs px-3 py-2"
                        />
                        <select
                          value={asset.type}
                          onChange={(e) => handleUpdate(asset.id, { type: e.target.value as UploadedAsset["type"] })}
                          className="app-select text-xs px-3 py-2 bg-white"
                        >
                          {ASSET_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <textarea
                          value={asset.description || ""}
                          onChange={(e) => handleUpdate(asset.id, { description: e.target.value })}
                          placeholder="Descrição / notas..."
                          rows={2}
                          className="app-textarea text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="app-primary-button w-full py-2 text-xs"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-gray-800 truncate">{asset.name}</p>
                        {asset.description && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{asset.description}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <div className="app-surface-soft py-12 text-center text-gray-400">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-semibold text-gray-500">Nenhum ativo enviado</p>
          <p className="text-sm mt-1">Suba logos, mascotes, elementos e padrões para enriquecer o brandbook.</p>
        </div>
      )}
    </div>
  );
}
