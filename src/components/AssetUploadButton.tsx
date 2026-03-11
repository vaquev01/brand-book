"use client";

import { useRef, useState } from "react";
import { ASSET_CATALOG, type AssetKey } from "@/lib/imagePrompts";

interface Props {
  assetKey: AssetKey;
  onUpload: (key: AssetKey, file: File) => void | Promise<void>;
  loading?: boolean;
  isOfficial?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Upload button that assigns a user file as the official asset for a given AssetKey.
 * Shows a pin badge when the current asset was uploaded (provider === "upload").
 */
export function AssetUploadButton({ assetKey, onUpload, loading, isOfficial, className = "", compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void onUpload(assetKey, file);
      e.target.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all
          ${isOfficial
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800"
          }
          ${compact ? "px-2 py-1" : "px-3 py-1.5"}
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
          ${className}`}
        title={isOfficial ? "Asset oficial (upload do usuário) — clique para substituir" : "Enviar arquivo próprio como asset oficial"}
      >
        {isOfficial ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l0 10" /><path d="M18.364 5.636l-7.071 7.071" /><circle cx="12" cy="12" r="10" />
            </svg>
            Oficial
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {compact ? "Upload" : "Enviar arquivo"}
          </>
        )}
      </button>
    </>
  );
}

/** Duplicate asset button — copies an existing asset to another key slot */
export function DuplicateAssetButton({
  sourceKey,
  onDuplicate,
  compact,
}: {
  sourceKey: AssetKey;
  onDuplicate: (sourceKey: AssetKey, targetKey: AssetKey) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = Object.entries(ASSET_CATALOG)
    .filter(([key, entry]) => key !== sourceKey && (
      key.toLowerCase().includes(search.toLowerCase()) ||
      entry.label.toLowerCase().includes(search.toLowerCase())
    ))
    .slice(0, 12);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 ${compact ? "px-2 py-1" : "px-3 py-1.5"}`}
        title="Duplicar este asset para outro slot"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
        {compact ? "Duplicar" : "Duplicar para..."}
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 w-64 bg-white border rounded-xl shadow-xl p-2 max-h-72 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar slot..."
            className="w-full text-xs border rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 px-2 py-1">Nenhum slot encontrado</p>
          )}
          {filtered.map(([key, entry]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onDuplicate(sourceKey, key as AssetKey);
                setOpen(false);
                setSearch("");
              }}
              className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
            >
              <span className="font-semibold text-gray-800 truncate">{entry.label}</span>
              <span className="text-gray-400 text-[10px] shrink-0">{entry.aspectRatio}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small badge to indicate an asset is an official upload */
export function OfficialBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
      Oficial
    </span>
  );
}
