"use client";

import { useState } from "react";
import type { BrandbookData } from "@/lib/types";
import { slugify } from "@/lib/common";

type JsonBySectionPanelProps = {
  data: BrandbookData;
  onDownload: (data: unknown, filename: string) => void;
};

export function JsonBySectionPanel({ data, onDownload }: JsonBySectionPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const slug = slugify(data.brandName);

  const sections: { id: string; icon: string; title: string; description: string; data: unknown }[] = [
    {
      id: "identity",
      icon: "🪪",
      title: "Identidade (Base)",
      description: "brandName, industry, brandConcept",
      data: {
        brandName: data.brandName,
        industry: data.industry,
        brandConcept: data.brandConcept,
      },
    },
    ...(data.positioning
      ? [{
          id: "positioning",
          icon: "🧭",
          title: "Posicionamento",
          description: "positioning — categoria, statement, diferenciais, concorrentes, RTBs",
          data: { positioning: data.positioning },
        }]
      : []),
    ...(data.audiencePersonas
      ? [{
          id: "audience",
          icon: "🧑‍💼",
          title: "Público-alvo (Personas)",
          description: "audiencePersonas — objetivos, dores, objeções, canais",
          data: { audiencePersonas: data.audiencePersonas },
        }]
      : []),
    ...(data.verbalIdentity
      ? [{
          id: "verbal",
          icon: "🗣️",
          title: "Identidade Verbal & Mensagens",
          description: "verbalIdentity — tagline, pillars, do/don't, vocabulário, CTAs",
          data: { verbalIdentity: data.verbalIdentity },
        }]
      : []),
    {
      id: "logo",
      icon: "🖼️",
      title: "Logo & Identidade Visual",
      description: "logo — primary, secondary, favicon, clearSpace, minSize, incorrectUsages",
      data: { logo: data.logo },
    },
    ...(data.logoVariants
      ? [{
          id: "logoVariants",
          icon: "🧩",
          title: "Variações de Logo",
          description: "logoVariants — horizontal, stacked, mono, negative, mark/word",
          data: { logoVariants: data.logoVariants },
        }]
      : []),
    {
      id: "colors",
      icon: "🎨",
      title: "Sistema de Cores",
      description: "colors — primary, secondary, semantic, dataViz",
      data: { colors: data.colors },
    },
    {
      id: "typography",
      icon: "🔤",
      title: "Tipografia",
      description: "typography — marketing/primary, ui/secondary, monospace",
      data: { typography: data.typography },
    },
    ...(data.typographyScale
      ? [{
          id: "typographyScale",
          icon: "📏",
          title: "Escala Tipográfica",
          description: "typographyScale — estilos H1/H2/body/caption etc",
          data: { typographyScale: data.typographyScale },
        }]
      : []),
    ...(data.uiGuidelines
      ? [{
          id: "uiGuidelines",
          icon: "🧱",
          title: "Guidelines de UI",
          description: "uiGuidelines — grid, densidade, componentes, estados, a11y",
          data: { uiGuidelines: data.uiGuidelines },
        }]
      : []),
    {
      id: "keyvisual",
      icon: "🔮",
      title: "Key Visual & Linguagem Gráfica",
      description: "keyVisual — elements, photographyStyle, iconography, illustrations, marketingArchitecture",
      data: { keyVisual: data.keyVisual },
    },
    ...(data.designTokens || data.accessibility
      ? [{
          id: "tokens",
          icon: "📐",
          title: "Design Tokens & Acessibilidade",
          description: "designTokens, accessibility — spacing, radii, shadows, WCAG rules",
          data: {
            ...(data.designTokens && { designTokens: data.designTokens }),
            ...(data.accessibility && { accessibility: data.accessibility }),
          },
        }]
      : []),
    ...(data.uxPatterns || data.microcopy || data.motion
      ? [{
          id: "ux",
          icon: "💬",
          title: "UX Patterns, Microcopy & Motion",
          description: "uxPatterns, microcopy, motion — onboarding, empty states, transitions",
          data: {
            ...(data.uxPatterns && { uxPatterns: data.uxPatterns }),
            ...(data.microcopy && { microcopy: data.microcopy }),
            ...(data.motion && { motion: data.motion }),
          },
        }]
      : []),
    {
      id: "applications",
      icon: "🖨️",
      title: "Aplicações de Marca",
      description: "applications — type, description, imagePlaceholder para cada peça",
      data: { applications: data.applications },
    },
    ...(data.productionGuidelines
      ? [{
          id: "production",
          icon: "📦",
          title: "Produção & Handoff",
          description: "productionGuidelines — specs de impressão/digital, checklist, entregáveis",
          data: { productionGuidelines: data.productionGuidelines },
        }]
      : []),
    ...(data.imageGenerationBriefing
      ? [{
          id: "imagegen",
          icon: "🤖",
          title: "Briefing de Geração de Imagens",
          description: "imageGenerationBriefing — prompts para DALL-E 3, Stability AI, Ideogram",
          data: { imageGenerationBriefing: data.imageGenerationBriefing },
        }]
      : []),
  ];

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copySection(id: string, sectionData: unknown) {
    await navigator.clipboard.writeText(JSON.stringify(sectionData, null, 2));
    setCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 border rounded-xl px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">JSON por Seção</h3>
          <p className="text-sm text-gray-500">
            Exporte ou copie cada bloco do brandbook individualmente — identidade, cores, tipografia, tokens, UX e aplicações.
          </p>
        </div>
        <button
          onClick={() => onDownload(data, `${slug}-brandbook-completo.json`)}
          className="shrink-0 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          ↓ Tudo em JSON
        </button>
      </div>

      {sections.map((section) => {
        const isOpen = expanded[section.id];
        const isCopied = copied[section.id];
        const jsonStr = JSON.stringify(section.data, null, 2);

        return (
          <div key={section.id} className="bg-white border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleExpand(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{section.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{section.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{section.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    void copySection(section.id, section.data);
                  }}
                  className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                >
                  {isCopied ? "✓ Copiado" : "Copiar"}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(section.data, `${slug}-${section.id}.json`);
                  }}
                  className="cursor-pointer text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg font-medium transition"
                >
                  ↓ JSON
                </span>
                <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t">
                <div className="bg-gray-900 p-4 overflow-auto max-h-96">
                  <pre className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{jsonStr}</pre>
                </div>
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-t">
                  <span className="text-xs text-gray-400">
                    {jsonStr.split("\n").length} linhas · {Math.round((jsonStr.length / 1024) * 10) / 10} KB
                  </span>
                  <button
                    onClick={() => void copySection(section.id, section.data)}
                    className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-700 transition"
                  >
                    {isCopied ? "✓ Copiado!" : "Copiar JSON"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
