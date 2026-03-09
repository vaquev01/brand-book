"use client";

import { ImageProvider } from "@/lib/types";
import { PROVIDERS } from "@/hooks/useImageGeneration";

interface Props {
  /** null = use global provider */
  value: ImageProvider | null;
  onChange: (v: ImageProvider | null) => void;
}

const SHORT_LABELS: Record<ImageProvider, string> = {
  dalle3: "D·E",
  stability: "SD",
  ideogram: "IDG",
  imagen: "G·I",
};

export function PerImageProviderSelect({ value, onChange }: Props) {
  return (
    <div className="no-print flex items-center gap-1 flex-wrap">
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">via</span>
      {PROVIDERS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(active ? null : p.id)}
            title={`${p.name}${active ? " (clique para usar global)" : ""}`}
            className={`text-[9px] font-black px-1.5 py-0.5 rounded transition-all ${
              active
                ? "bg-gray-900 text-white shadow-sm scale-105"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {SHORT_LABELS[p.id]}
          </button>
        );
      })}
    </div>
  );
}
