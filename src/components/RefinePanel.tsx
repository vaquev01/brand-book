"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";
import { Wand2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
  textProvider: "openai" | "gemini";
  onRefined: (updated: BrandbookData) => void;
}

const SUGGESTIONS = [
  "Torne a identidade mais minimalista e sofisticada",
  "Adicione mais personalidade jovem e irreverente ao tom de voz",
  "Faça as cores transmitirem mais luxo e exclusividade",
  "Torne o posicionamento mais agressivo e diferenciado",
  "Adicione mais profundidade ao design system e componentes",
  "Fortaleça a identidade verbal com headlines mais impactantes",
  "Torne a tipografia mais moderna e expressiva",
  "Adicione mais detalhe às diretrizes de aplicação da marca",
];

export function RefinePanel({ brandbook, apiKeys, textProvider, onRefined }: Props) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRefine() {
    if (!instruction.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          instruction,
          provider: textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao refinar brandbook");

      onRefined(data as BrandbookData);
      setSuccess("Brandbook refinado com sucesso!");
      setInstruction("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-base mb-1">Refinar Brandbook com IA</h3>
        <p className="text-sm text-gray-500">
          Descreva o que você quer mudar. A IA aplicará a instrução de forma coerente em todo o brandbook.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Sugestões rápidas
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInstruction(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400 transition text-gray-700"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          rows={3}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='Ex: "Torne a marca mais premium — cores mais escuras, tipografia com mais autoridade, posicionamento mais exclusivo"'
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none shadow-inner"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      <button
        type="button"
        onClick={handleRefine}
        disabled={loading || !instruction.trim()}
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Refinando... (pode levar até 40s)
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Aplicar refinamento
          </>
        )}
      </button>
    </div>
  );
}
