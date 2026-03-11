"use client";

import { useRef } from "react";
import type { AssetKey } from "@/lib/imagePrompts";

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
