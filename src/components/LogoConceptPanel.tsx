"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
}

const STYLES = [
  { value: "moderno e minimalista", label: "Minimalista" },
  { value: "bold, geométrico e contemporâneo", label: "Bold & Geométrico" },
  { value: "vintage, artesanal e texturizado", label: "Vintage" },
  { value: "luxury, refinado e sofisticado", label: "Luxo" },
  { value: "tecnológico, digital e futurista", label: "Tech/Futurista" },
  { value: "orgânico, sustentável e natural", label: "Orgânico" },
  { value: "playful, colorido e divertido", label: "Playful" },
  { value: "corporativo, sério e profissional", label: "Corporativo" },
];

interface LogoConcept {
  url: string;
  prompt: string;
  style: string;
}

export function LogoConceptPanel({ brandbook, apiKeys }: Props) {
  const [style, setStyle] = useState("moderno e minimalista");
  const [concepts, setConcepts] = useState<LogoConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  async function handleGenerate() {
    if (!apiKeys.openai) {
      setError("DALL-E 3 requer uma OpenAI API Key. Configure em ⚙ APIs.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          style,
          openaiKey: apiKeys.openai || undefined,
        }),
      });

      const data = await res.json() as { url?: string; prompt?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao gerar logo");
      if (!data.url) throw new Error("Sem URL de imagem retornada");

      setConcepts((prev) => [
        { url: data.url!, prompt: data.prompt ?? "", style },
        ...prev,
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function downloadConcept(url: string, index: number) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${brandbook.brandName.toLowerCase().replace(/\s+/g, "-")}-logo-concept-${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base mb-1">Gerar Conceitos de Logo com DALL-E 3</h3>
        <p className="text-sm text-gray-500">
          Gere conceitos visuais de logo usando DALL-E 3, baseados na identidade definida no brandbook.
          Requer OpenAI API Key.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Estilo visual
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`text-xs py-2 px-3 rounded-lg border-2 transition font-medium ${
                style === s.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !apiKeys.openai}
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando conceito de logo... (15-30s)
          </>
        ) : !apiKeys.openai ? (
          "⚠ Configure OpenAI API Key para usar DALL-E 3"
        ) : (
          "✦ Gerar conceito de logo"
        )}
      </button>

      {concepts.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">
            Conceitos gerados ({concepts.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {concepts.map((concept, i) => (
              <div key={i} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 p-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Conceito #{concepts.length - i} — {STYLES.find(s => s.value === concept.style)?.label ?? concept.style}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadConcept(concept.url, i)}
                    title="Download concept"
                    className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition"
                  >
                    ↓ Download
                  </button>
                </div>
                <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={concept.url}
                    alt={`Logo concept #${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="border-t">
                  <button
                    type="button"
                    onClick={() => setExpandedPrompt(expandedPrompt === i ? null : i)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
                  >
                    {expandedPrompt === i ? "▲ Ocultar prompt" : "▼ Ver prompt DALL-E"}
                  </button>
                  {expandedPrompt === i && (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded p-3">{concept.prompt}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
