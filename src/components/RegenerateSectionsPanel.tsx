"use client";

import { useState } from "react";
import type { AiTextProvider, BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
  strategyProvider: AiTextProvider;
  onUpdated: (updated: BrandbookData) => void;
}

interface SectionConfig {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  { key: "brandConcept", label: "DNA & Conceito", icon: "🧬", description: "Propósito, visão, missão, valores e personalidade" },
  { key: "brandStory", label: "Brand Story & Manifesto", icon: "📖", description: "Manifesto de marca, história de origem e promessa" },
  { key: "positioning", label: "Posicionamento", icon: "🧭", description: "Claim, diferenciação, proposta de valor e arquétipos" },
  { key: "audiencePersonas", label: "Personas", icon: "👥", description: "Perfis de público, dores, desejos e motivações" },
  { key: "verbalIdentity", label: "Identidade Verbal", icon: "✍️", description: "Tom de voz, tagline, headlines, vocabulário e tom por canal" },
  { key: "logo", label: "Logo", icon: "⬡", description: "Conceito, geometria, aplicações e usos proibidos" },
  { key: "colors", label: "Cores", icon: "🎨", description: "Paleta primária, secundária, semântica, Pantone e uso" },
  { key: "typography", label: "Tipografia", icon: "Aa", description: "Famílias tipográficas e diretrizes de uso" },
  { key: "typographyScale", label: "Escala Tipográfica", icon: "T↑", description: "Hierarchy de tamanhos, pesos e line-heights" },
  { key: "keyVisual", label: "Identidade Visual", icon: "✦", description: "Elementos visuais, mascotes, símbolos e padrões" },
  { key: "designTokens", label: "Design Tokens", icon: "🪙", description: "Espaçamento, raios, sombras e grid" },
  { key: "uiGuidelines", label: "UI Guidelines", icon: "🖥️", description: "Componentes, estados, dark mode e ícones" },
  { key: "applications", label: "Aplicações", icon: "📐", description: "Peças de impressão, digital e social media com dimensões" },
  { key: "socialMediaGuidelines", label: "Guia de Redes Sociais", icon: "📱", description: "Formatos, tom por plataforma, pilares e exemplos de post" },
  { key: "imageGenerationBriefing", label: "Briefing de Imagens", icon: "🖼️", description: "Diretrizes para geração de imagens IA" },
];

export function RegenerateSectionsPanel({ brandbook, apiKeys, strategyProvider, onUpdated }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [externalUrlsRaw, setExternalUrlsRaw] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegenerate(sectionKey: string) {
    setLoading(sectionKey);
    setError("");
    setSuccess("");

    const externalUrls = externalUrlsRaw
      .split(/[\n,\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith("@") ? `https://www.instagram.com/${s.slice(1)}/` : s))
      .map((s) => (s.startsWith("www.") ? `https://${s}` : s))
      .filter((s) => /^https?:\/\//i.test(s));

    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          sectionKey,
          instruction: instruction.trim() || undefined,
          externalUrls: externalUrls.length > 0 ? externalUrls : undefined,
          provider: strategyProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: strategyProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
          googleModel: strategyProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
        }),
      });

      const data = await res.json() as { section?: unknown; error?: string };
      if (!res.ok) throw new Error(data.error || "Erro ao regenerar seção");
      if (!data.section) throw new Error("Seção vazia retornada pela IA");

      const updated = { ...brandbook, [sectionKey]: data.section } as BrandbookData;
      onUpdated(updated);
      setSuccess(`Seção "${SECTIONS.find((s) => s.key === sectionKey)?.label}" regenerada!`);
      setSelected(null);
      setInstruction("");
      setExternalUrlsRaw("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(null);
    }
  }

  const availableSections = SECTIONS.filter((s) => s.key in brandbook);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-base mb-1">Regenerar Seções Individuais</h3>
        <p className="text-sm text-gray-500">
          Regenere qualquer seção preservando a coerência com o restante do brandbook. Opcionalmente, dê uma instrução específica.
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

      <div className="grid grid-cols-1 gap-2">
        {availableSections.map((section) => {
          const isSelected = selected === section.key;
          const isLoading = loading === section.key;

          return (
            <div
              key={section.key}
              className={`app-surface-soft overflow-hidden transition-all ${
                isSelected ? "border-slate-900/20 shadow-[0_24px_44px_-34px_rgba(15,23,42,0.32)]" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : section.key)}
                disabled={!!loading}
                className="w-full flex items-center gap-4 p-4 text-left transition hover:bg-white/70 disabled:opacity-50"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900">{section.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.description}</div>
                </div>
                {isSelected
                  ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
              </button>

              {isSelected && (
                <div className="space-y-3 border-t border-slate-200/80 bg-white/60 px-4 py-4">
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={`Instrução opcional para esta seção... (ex: "Torne mais criativo e diferenciado")`}
                    className="app-textarea"
                  />
                  <textarea
                    rows={2}
                    value={externalUrlsRaw}
                    onChange={(e) => setExternalUrlsRaw(e.target.value)}
                    placeholder="Referências externas (URLs) — 1 por linha (opcional)"
                    className="app-textarea"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate(section.key)}
                      disabled={isLoading}
                      className="app-primary-button flex-1 px-4 py-2.5 text-sm"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Regenerando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Regenerar {section.label}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelected(null); setInstruction(""); setExternalUrlsRaw(""); }}
                      className="app-secondary-button px-4 py-2 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
