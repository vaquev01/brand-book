"use client";

import { useState } from "react";
import { BriefingImageUpload } from "./BriefingImageUpload";
import type { GenerateScope, CreativityLevel, UploadedAsset } from "@/lib/types";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";

interface GuidedBriefing {
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

export interface GenerateBriefingData {
  brandName: string;
  industry: string;
  briefing: string;
  scope: GenerateScope;
  creativityLevel: CreativityLevel;
  intentionality: boolean;
  referenceImages: UploadedAsset[];
  logoImage?: UploadedAsset;
}

interface Props {
  onSubmit: (data: GenerateBriefingData) => void;
  loading: boolean;
  error: string;
}

const SCOPE_OPTIONS: { value: GenerateScope; icon: string; label: string; desc: string }[] = [
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

const CREATIVITY_OPTIONS: { value: CreativityLevel; icon: string; label: string; sub: string; color: string }[] = [
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

function composeBriefing(g: GuidedBriefing, rawBriefing: string): string {
  const parts: string[] = [];
  if (g.whatItDoes) parts.push(`O que faz: ${g.whatItDoes}`);
  if (g.targetAudience) parts.push(`Público-alvo: ${g.targetAudience}`);
  if (g.positioning) parts.push(`Posicionamento desejado: ${g.positioning}`);
  if (g.references) parts.push(`Referências de marcas admiradas: ${g.references}`);
  if (g.instagramLinks) parts.push(`Instagram / links oficiais (para capturar essência): ${g.instagramLinks}`);
  if (g.essenceReferences) parts.push(`Referências de essência (tom, cultura, estética, arquétipos): ${g.essenceReferences}`);
  if (g.avoidances) parts.push(`O que evitar / não transmitir: ${g.avoidances}`);
  if (g.colorPreferences) parts.push(`Preferências de cores: ${g.colorPreferences}`);
  if (g.hasMascot) {
    parts.push(`Mascote/personagem: ${g.mascotDescription || "Sim, criar um personagem único para a marca"}`);
  }
  if (g.extraContext) parts.push(`Contexto adicional: ${g.extraContext}`);
  if (rawBriefing.trim()) parts.push(`Briefing livre: ${rawBriefing.trim()}`);
  return parts.join("\n");
}

export function GenerateBriefingForm({ onSubmit, loading, error }: Props) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [rawBriefing, setRawBriefing] = useState("");
  const [scope, setScope] = useState<GenerateScope>("full");
  const [creativity, setCreativity] = useState<CreativityLevel>("balanced");
  const [intentionality, setIntentionality] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [referenceImages, setReferenceImages] = useState<UploadedAsset[]>([]);
  const [logoImage, setLogoImage] = useState<UploadedAsset | null>(null);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [logoDragActive, setLogoDragActive] = useState(false);
  const [guided, setGuided] = useState<GuidedBriefing>({
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
  });

  function updateGuided(field: keyof GuidedBriefing, value: string | boolean) {
    setGuided((prev) => ({ ...prev, [field]: value }));
  }

  const filledGuidedCount = [
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalBriefing = composeBriefing(guided, rawBriefing);
    onSubmit({
      brandName,
      industry,
      briefing: finalBriefing,
      scope,
      creativityLevel: creativity,
      intentionality,
      referenceImages,
      logoImage: logoImage ?? undefined,
    });
  }

  const selectedCreativity = CREATIVITY_OPTIONS.find((o) => o.value === creativity)!;

  async function setLogoFromFile(file: File) {
    setLogoUploadError("");

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("Envie um arquivo de imagem (PNG, SVG, JPG, etc).");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setLogoUploadError("Arquivo muito grande. Tente um logo menor (máx. 12MB).");
      return;
    }

    try {
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
      const dataUrl = isSvg
        ? await rasterFileToOptimizedDataUrl(file, 1024, "image/png", 0.92)
        : await rasterFileToOptimizedDataUrl(file, 1024, "image/webp", 0.9);

      if (dataUrl.length > 3_500_000) {
        setLogoUploadError("Logo muito pesado para enviar. Tente uma versão menor ou em PNG/SVG simplificado.");
        return;
      }

      setLogoImage({ id: `logo-${Date.now()}`, name: file.name, dataUrl, type: "logo" });
    } catch {
      setLogoUploadError("Falha ao processar o logo. Tente PNG/JPG.");
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void setLogoFromFile(file);
    e.target.value = "";
  }

  function handleLogoDrop(e: React.DragEvent) {
    e.preventDefault();
    setLogoDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void setLogoFromFile(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* HERO: Logo Upload */}
      <div
        onDrop={handleLogoDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setLogoDragActive(true)}
        onDragLeave={() => setLogoDragActive(false)}
        className={`rounded-2xl border-2 transition-all overflow-hidden relative group ${
          logoImage
            ? "border-gray-900 bg-gray-50 shadow-inner"
            : logoDragActive
              ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/20"
              : "border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50"
        }`}
      >
        <label className="flex flex-col items-center justify-center cursor-pointer p-10 text-center" htmlFor="logo-upload-input">
          {logoImage ? (
            <>
              <div className="w-28 h-28 rounded-2xl bg-white border flex items-center justify-center mb-4 shadow-sm overflow-hidden p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoImage.dataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{logoImage.name}</p>
              <p className="text-xs text-gray-500 mt-1">A IA vai analisar e construir o brandbook a partir deste logo</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setLogoImage(null); }}
                className="mt-4 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Remover logo
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19.5 3-3 3 3"/><path d="M17 22v-5.5"/><circle cx="9" cy="9" r="2"/></svg>
              </div>
              <p className="font-extrabold text-gray-900 text-lg">Faça upload do seu Logo</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">A IA extrai cores, estilo e personalidade do seu logo atual (PNG, SVG, JPG)</p>
              <span className="mt-5 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-800 transition-colors inline-block">
                Selecionar arquivo
              </span>
              <p className="text-xs font-medium text-gray-400 mt-4 uppercase tracking-wider">
                Opcional — sem logo, a IA cria a identidade do zero
              </p>
            </>
          )}
        </label>
        <input
          id="logo-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {logoUploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle text-red-600 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <p className="text-sm text-red-800 font-semibold">{logoUploadError}</p>
        </div>
      )}

      {logoImage && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 shadow-sm flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-indigo-600 flex-shrink-0 mt-0.5"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
          <div>
            <p className="text-sm text-indigo-900 font-bold">Modo &quot;Logo-First&quot; Ativado</p>
            <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
              A IA fará uma análise visual forense do seu logo extraindo cores exatas, estilo tipográfico, geometria e mood para construir um brandbook perfeitamente coerente.
            </p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2 text-gray-400"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          <h3 className="font-bold text-gray-900">Informações Básicas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="brandName" className="block text-sm font-bold text-gray-700 mb-2">
              Nome da Marca <span className="text-red-500">*</span>
            </label>
            <input
              id="brandName"
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: Neon Tokyo, CloudFlow..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-base font-medium placeholder:font-normal"
            />
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-bold text-gray-700 mb-2">
              Indústria / Nicho <span className="text-red-500">*</span>
            </label>
            <input
              id="industry"
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Ex: SaaS B2B, Restaurante..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Scope */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crosshair text-gray-400"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
          <div>
            <h3 className="font-bold text-gray-900">O que gerar?</h3>
            <p className="text-xs text-gray-500 mt-0.5">Escolha o foco principal do brandbook</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setScope(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                scope === opt.value
                  ? "border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600/20"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
              }`}
            >
              <div className="text-2xl mb-2 opacity-90">{opt.icon}</div>
              <div className={`font-bold text-sm ${scope === opt.value ? "text-indigo-900" : "text-gray-900"}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1.5 leading-relaxed ${scope === opt.value ? "text-indigo-700/80" : "text-gray-500"}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Creativity Level */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette text-gray-400"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
          <div>
            <h3 className="font-bold text-gray-900">Nível de criatividade</h3>
            <p className="text-xs text-gray-500 mt-0.5">Como a IA deve se posicionar criativamente</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CREATIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCreativity(opt.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                creativity === opt.value
                  ? opt.color + " border-current shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="font-bold text-sm">{opt.label}</div>
              <div className="text-[11px] mt-0.5 opacity-70 leading-tight">{opt.sub}</div>
            </button>
          ))}
        </div>
        {creativity !== "balanced" && (
          <div className={`mt-3 text-xs px-4 py-3 rounded-xl border ${selectedCreativity.color}`}>
            <strong>{selectedCreativity.icon} {selectedCreativity.label}:</strong>{" "}
            {creativity === "conservative" && "Paleta de no máximo 3 cores, formas limpas, tipografia com autoridade. Estilo IBM, Rolex, McKinsey."}
            {creativity === "creative" && "Cores inesperadas mas coesas, tipografia com personalidade forte. Estilo Spotify, Oatly, MailChimp."}
            {creativity === "experimental" && "Quebra de convenções intencional. Cult brand potential. Estilo Saul Bass, Paula Scher, Stefan Sagmeister."}
          </div>
        )}
      </div>

      {/* Intentionality Toggle */}
      <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
        <button
          type="button"
          role="switch"
          aria-checked={intentionality}
          aria-label="Alternar intenção e simbolismo"
          onClick={() => setIntentionality(!intentionality)}
          className={`mt-0.5 flex-shrink-0 w-12 h-6 rounded-full transition-colors relative ${
            intentionality ? "bg-amber-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
              intentionality ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
        <div>
          <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-text"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/></svg>
            Justificar simbolismo?
          </h4>
          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
            Se ativado, a IA escreverá parágrafos mais longos explicando <strong>por que</strong> escolheu cada cor, tipografia ou elemento, criando narrativas sobre como isso se conecta ao posicionamento. <em>(Aumenta o tempo de geração e o tamanho dos textos)</em>
          </p>
        </div>
      </div>

      {/* Guided Briefing */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowGuided(!showGuided)}
          className="w-full flex items-center justify-between px-6 py-5 bg-gray-50 hover:bg-indigo-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list text-gray-500"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            <span className="font-bold text-gray-900 text-sm">Briefing Guiado</span>
            <span className="text-xs font-medium text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
              {filledGuidedCount > 0
                ? `${filledGuidedCount} preenchido${filledGuidedCount > 1 ? "s" : ""}`
                : "Opcional"}
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform duration-200 ${showGuided ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {showGuided && (
          <div className="p-5 space-y-4 border-t">
            <GuidedField
              label="O que a marca faz?"
              hint="Descreva o produto/serviço em 1-3 frases"
              placeholder="Ex: Plataforma de gestão de tarefas para times remotos. Foca em simplicidade e foco, não em features."
              value={guided.whatItDoes}
              onChange={(v) => updateGuided("whatItDoes", v)}
            />
            <GuidedField
              label="Quem é o público-alvo?"
              hint="Contexto de vida, faixa etária, comportamento, valores"
              placeholder="Ex: Profissionais 28-42 anos, altamente digitais, que valorizam produtividade e detestam burocracia"
              value={guided.targetAudience}
              onChange={(v) => updateGuided("targetAudience", v)}
            />
            <GuidedField
              label="Posicionamento desejado"
              hint="Como a marca deve ser percebida versus a concorrência"
              placeholder='Ex: A alternativa premium e minimalista ao Trello — menos features, mais foco. "O Notion para quem tem TDAH."'
              value={guided.positioning}
              onChange={(v) => updateGuided("positioning", v)}
            />
            <GuidedField
              label="Referências de marcas"
              hint="Marcas que você admira esteticamente ou estrategicamente (não precisam ser do mesmo setor)"
              placeholder="Ex: Visualmente: Notion, Linear, Arc Browser. Estrategicamente: Apple, Supreme. Tom de voz: Oatly."
              value={guided.references}
              onChange={(v) => updateGuided("references", v)}
            />
            <GuidedField
              label="Instagram / links oficiais"
              hint="Cole perfis e links que representem a essência (ex: instagram.com/suaMarca)"
              placeholder="Ex: https://instagram.com/suaMarca\nhttps://site.com\nhttps://linkedin.com/company/suaMarca"
              value={guided.instagramLinks}
              onChange={(v) => updateGuided("instagramLinks", v)}
              rows={3}
            />
            <GuidedField
              label="Essência da marca (referências)"
              hint="Cultura, estética, vibe, arquétipos, filmes, artistas, lugares, décadas, movimentos"
              placeholder="Ex: Arquétipo: Rebelde elegante. Estética: brutalismo + luxo discreto. Referências: Blade Runner, Dieter Rams, Tadao Ando."
              value={guided.essenceReferences}
              onChange={(v) => updateGuided("essenceReferences", v)}
              rows={3}
            />
            <GuidedField
              label="O que a marca NÃO deve transmitir"
              hint="Evite, proibições, o que seria fora do tom"
              placeholder="Ex: Corporativo demais, genérico, alegre/colorido em excesso, complexo, intimidador"
              value={guided.avoidances}
              onChange={(v) => updateGuided("avoidances", v)}
            />
            <GuidedField
              label="Preferências de cores"
              hint="Restrições, preferências, o que inspira — ou o que evitar"
              placeholder="Ex: Evitar azul corporativo. Prefiro paleta escura com um acento vibrante. Referência: Figma."
              value={guided.colorPreferences}
              onChange={(v) => updateGuided("colorPreferences", v)}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={guided.hasMascot}
                aria-label="Alternar mascote"
                onClick={() => updateGuided("hasMascot", !guided.hasMascot)}
                className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors relative ${
                  guided.hasMascot ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    guided.hasMascot ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm font-medium">A marca deve ter mascote ou personagem?</span>
            </div>

            {guided.hasMascot && (
              <GuidedField
                label="Descreva o mascote"
                hint="Personalidade, aparência, referências visuais"
                placeholder="Ex: Um robô rechonchudo e amigável, como o Michelin mas tech. Personalidade: nerd entusiasmado que simplifica o complexo."
                value={guided.mascotDescription}
                onChange={(v) => updateGuided("mascotDescription", v)}
              />
            )}

            <GuidedField
              label="Contexto adicional"
              hint="Qualquer outra informação relevante para a IA"
              placeholder="Ex: A marca já tem um logo que não pode mudar, mas tudo mais pode evoluir. Budget para produção é alto."
              value={guided.extraContext}
              onChange={(v) => updateGuided("extraContext", v)}
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Raw Briefing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-align-left text-gray-400"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>
          <div>
            <h3 className="font-bold text-gray-900">Briefing Livre</h3>
            <p className="text-xs text-gray-500 mt-0.5">Complementa o briefing guiado acima</p>
          </div>
        </div>
        <textarea
          id="rawBriefing"
          rows={4}
          value={rawBriefing}
          onChange={(e) => setRawBriefing(e.target.value)}
          placeholder="Qualquer detalhe extra, contexto histórico, inspirações, restrições, objetivos de negócio..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none placeholder:text-gray-400"
        />
      </div>

      {/* Reference Images */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-images text-gray-400"><path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/></svg>
          <div>
            <h3 className="font-bold text-gray-900">Imagens de Referência</h3>
            <p className="text-xs text-gray-500 mt-0.5">Opcional — a IA analisa e replica estilo, paleta e composição</p>
          </div>
        </div>
        <BriefingImageUpload images={referenceImages} onChange={setReferenceImages} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
            Gerar Brandbook
          </>
        )}
      </button>
    </form>
  );
}

function GuidedField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-gray-400">{hint}</span>
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition resize-none"
        aria-label={label}
      />
    </div>
  );
}
