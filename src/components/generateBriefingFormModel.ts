import type { CreativityLevel, GenerateScope, UploadedAsset } from "@/lib/types";

export interface GuidedBriefing {
  whatItDoes: string;
  targetAudience: string;
  positioning: string;
  references: string;
  instagramLinks: string;
  essenceReferences: string;
  avoidances: string;
  colorPreferences: string;
  hasMascot: boolean;
  mascotDescription: string;
  extraContext: string;
}

export type ProjectMode = "new_brand" | "rebrand";

export interface GenerateBriefingData {
  brandName: string;
  industry: string;
  briefing: string;
  externalUrls?: string[];
  projectMode: ProjectMode;
  scope: GenerateScope;
  creativityLevel: CreativityLevel;
  intentionality: boolean;
  referenceImages: UploadedAsset[];
  logoImage?: UploadedAsset;
}

export const SCOPE_OPTIONS: { value: GenerateScope; icon: string; label: string; desc: string }[] = [
  {
    value: "full",
    icon: "🌟",
    label: "Brandbook Completo",
    desc: "Estratégia + identidade visual + design system + produção — tudo com profundidade máxima",
  },
  {
    value: "logo_identity",
    icon: "🖼️",
    label: "Logo & Identidade",
    desc: "Foco máximo em logo, cores com simbolismo, tipografia, key visual, mascotes e padrões",
  },
  {
    value: "strategy",
    icon: "🧭",
    label: "Estratégia & Marca",
    desc: "Foco em posicionamento, personas detalhadas, identidade verbal e brand concept profundo",
  },
  {
    value: "design_system",
    icon: "🎨",
    label: "Design System",
    desc: "Foco em tokens, componentes com estados, UX patterns, acessibilidade e motion",
  },
];

export const CREATIVITY_OPTIONS: { value: CreativityLevel; icon: string; label: string; sub: string; color: string }[] = [
  {
    value: "conservative",
    icon: "🏛️",
    label: "Clássico",
    sub: "Atemporal, confiável, autoridade",
    color: "border-slate-400 bg-slate-50 text-slate-800",
  },
  {
    value: "balanced",
    icon: "⚖️",
    label: "Equilibrado",
    sub: "Moderno, memorável, acessível",
    color: "border-blue-400 bg-blue-50 text-blue-900",
  },
  {
    value: "creative",
    icon: "🔥",
    label: "Ousado",
    sub: "Distinto, emocional, inesquecível",
    color: "border-orange-400 bg-orange-50 text-orange-900",
  },
  {
    value: "experimental",
    icon: "🧪",
    label: "Experimental",
    sub: "Vanguarda, cult brand potential",
    color: "border-purple-400 bg-purple-50 text-purple-900",
  },
];

export function createEmptyGuidedBriefing(): GuidedBriefing {
  return {
    whatItDoes: "",
    targetAudience: "",
    positioning: "",
    references: "",
    instagramLinks: "",
    essenceReferences: "",
    avoidances: "",
    colorPreferences: "",
    hasMascot: false,
    mascotDescription: "",
    extraContext: "",
  };
}

export function composeBriefing(guided: GuidedBriefing, rawBriefing: string): string {
  const parts: string[] = [];
  if (guided.whatItDoes) parts.push(`══ O QUE A MARCA FAZ ══\n${guided.whatItDoes}`);
  if (guided.targetAudience) parts.push(`══ PÚBLICO-ALVO ══\n${guided.targetAudience}`);
  if (guided.positioning) parts.push(`══ POSICIONAMENTO DESEJADO ══\n${guided.positioning}`);
  if (guided.references) parts.push(`══ REFERÊNCIAS DE MARCAS ══\n${guided.references}`);
  if (guided.instagramLinks) parts.push(`══ INSTAGRAM / LINKS OFICIAIS ══\n${guided.instagramLinks}`);
  if (guided.essenceReferences) parts.push(`══ ESSÊNCIA DA MARCA (CULTURA, ESTÉTICA, ARQUÉTIPOS) ══\n${guided.essenceReferences}`);
  if (guided.avoidances) parts.push(`══ O QUE EVITAR / NÃO TRANSMITIR ══\n${guided.avoidances}`);
  if (guided.colorPreferences) parts.push(`══ PREFERÊNCIAS DE CORES ══\n${guided.colorPreferences}`);
  if (guided.hasMascot) {
    parts.push(`══ MASCOTE / PERSONAGEM ══\n${guided.mascotDescription || "Sim, criar um personagem único para a marca"}`);
  }
  if (guided.extraContext) parts.push(`══ CONTEXTO ADICIONAL ══\n${guided.extraContext}`);
  if (rawBriefing.trim()) parts.push(`══ BRIEFING LIVRE ══\n${rawBriefing.trim()}`);
  return parts.join("\n\n");
}

export function countFilledGuidedFields(guided: GuidedBriefing): number {
  return [
    guided.whatItDoes,
    guided.targetAudience,
    guided.positioning,
    guided.references,
    guided.instagramLinks,
    guided.essenceReferences,
    guided.avoidances,
    guided.colorPreferences,
    guided.hasMascot ? "yes" : "",
    guided.extraContext,
  ].filter(Boolean).length;
}

export function parseExternalUrls(externalUrlsRaw: string): string[] {
  return externalUrlsRaw
    .split(/[\n,\s]+/g)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith("@") ? `https://www.instagram.com/${value.slice(1)}/` : value))
    .map((value) => (value.startsWith("www.") ? `https://${value}` : value))
    .filter((value) => /^https?:\/\//i.test(value));
}
