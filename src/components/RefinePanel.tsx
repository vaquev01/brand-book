"use client";

import { useState } from "react";
import type { AiTextProvider, BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";
import { Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
  strategyProvider: AiTextProvider;
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

export function RefinePanel({ brandbook, apiKeys, strategyProvider, onRefined }: Props) {
  const [instruction, setInstruction] = useState("");
  const [externalUrlsRaw, setExternalUrlsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingRefine, setPendingRefine] = useState<{ instruction: string; externalUrls: string[] } | null>(null);

  function handleRefineClick() {
    if (!instruction.trim()) return;

    const externalUrls = externalUrlsRaw
      .split(/[\n,\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith("@") ? `https://www.instagram.com/${s.slice(1)}/` : s))
      .map((s) => (s.startsWith("www.") ? `https://${s}` : s))
      .filter((s) => /^https?:\/\//i.test(s));

    setPendingRefine({ instruction: instruction.trim(), externalUrls });
    setShowConfirm(true);
  }

  async function handleRefine() {
    if (!pendingRefine) return;
    setShowConfirm(false);
    const { instruction: refineInstruction, externalUrls } = pendingRefine;
    setPendingRefine(null);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          instruction: refineInstruction,
          externalUrls: externalUrls.length > 0 ? externalUrls : undefined,
          provider: strategyProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: strategyProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
          googleModel: strategyProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao refinar brandbook");

      onRefined(data as BrandbookData);
      setSuccess("Brandbook refinado com sucesso!");
      setInstruction("");
      setExternalUrlsRaw("");
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
          Descreva as mudanças. A IA aplica em todo o brandbook.
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
              className="app-chip transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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
          className="app-textarea min-h-[108px] shadow-inner"
        />
      </div>

      <div className="app-surface-soft p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Referências externas (URLs)
        </label>
        <textarea
          rows={2}
          value={externalUrlsRaw}
          onChange={(e) => setExternalUrlsRaw(e.target.value)}
          placeholder="Cole links (1 por linha). Ex: https://www.instagram.com/usuario/"
          className="app-textarea"
        />
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Extrai metadados das URLs para orientar a IA. Alguns sites podem bloquear.
        </p>
      </div>

      {error && (
        <div className="app-surface-soft rounded-xl border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="app-surface-soft rounded-xl border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      <button
        type="button"
        onClick={handleRefineClick}
        disabled={loading || !instruction.trim()}
        className="app-primary-button w-full px-6 py-3"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Refinando... (até 40s)
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Aplicar refinamento
          </>
        )}
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Aplicar refinamento"
        description={`Isso vai alterar todo o brandbook com a instrução: "${pendingRefine?.instruction.slice(0, 120) ?? ""}${(pendingRefine?.instruction.length ?? 0) > 120 ? "..." : ""}"`}
        confirmLabel="Aplicar"
        cancelLabel="Cancelar"
        onConfirm={() => void handleRefine()}
        onCancel={() => { setShowConfirm(false); setPendingRefine(null); }}
      />
    </div>
  );
}
