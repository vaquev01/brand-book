"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import type { ApiKeys } from "./ApiKeyConfig";
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  brandbook: BrandbookData;
  apiKeys: ApiKeys;
  textProvider: "openai" | "gemini";
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

export function RegenerateSectionsPanel({ brandbook, apiKeys, textProvider, onUpdated }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegenerate(sectionKey: string) {
    setLoading(sectionKey);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook,
          sectionKey,
          instruction: instruction.trim() || undefined,
          provider: textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
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
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm flex items-center gap-2">
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
              className={`border rounded-xl overflow-hidden transition-all ${
                isSelected ? "border-gray-900 shadow-sm" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : section.key)}
                disabled={!!loading}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition disabled:opacity-50"
              >
                <span className="text-xl w-8 text-center flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{section.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{section.description}</div>
                </div>
                {isSelected
                  ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
              </button>

              {isSelected && (
                <div className="border-t px-4 py-4 bg-gray-50 space-y-3">
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={`Instrução opcional para esta seção... (ex: "Torne mais criativo e diferenciado")`}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRegenerate(section.key)}
                      disabled={isLoading}
                      className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-60 transition flex items-center justify-center gap-2"
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
                      onClick={() => { setSelected(null); setInstruction(""); }}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border rounded-lg hover:border-gray-400 transition"
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
