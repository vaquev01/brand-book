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
        className={`rounded-2xl border-2 transition-all ${
          logoImage
            ? "border-gray-900 bg-gray-50"
            : logoDragActive
              ? "border-gray-900 bg-gray-100"
              : "border-dashed border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
      >
        <label className="flex flex-col items-center justify-center cursor-pointer p-8 text-center" htmlFor="logo-upload-input">
          {logoImage ? (
            <>
              <div className="w-24 h-24 rounded-xl bg-white border flex items-center justify-center mb-4 shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoImage.dataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{logoImage.name}</p>
              <p className="text-xs text-gray-500 mt-1">A IA vai analisar e construir o brandbook a partir deste logo</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setLogoImage(null); }}
                className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
              >
                Remover logo
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                <span className="text-3xl">⬡</span>
              </div>
              <p className="font-bold text-gray-900">Arraste seu logo aqui</p>
              <p className="text-sm text-gray-500 mt-1">PNG, SVG, JPG — a IA extrai cores, estilo e personalidade</p>
              <span className="mt-4 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Selecionar arquivo
              </span>
              <p className="text-xs text-gray-400 mt-3">
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
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-800 font-semibold">{logoUploadError}</p>
        </div>
      )}

      {logoImage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-900 font-semibold">✦ Modo logo-first ativo</p>
          <p className="text-xs text-amber-700 mt-0.5">
            A IA vai fazer análise visual forense do seu logo — extraindo cores exatas, estilo tipográfico,
            geometria e mood — e construir todo o brandbook coerente com essa identidade.
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="brandName" className="block text-sm font-semibold mb-2">
            Nome da Marca <span className="text-red-500">*</span>
          </label>
          <input
            id="brandName"
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Ex: Neon Tokyo, CloudFlow, Raízes..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition text-base"
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-semibold mb-2">
            Indústria / Nicho <span className="text-red-500">*</span>
          </label>
          <input
            id="industry"
            type="text"
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Ex: SaaS B2B, Restaurante Japonês, Bar Temático, E-commerce de moda..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
          />
        </div>
      </div>

      {/* Scope */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          O que gerar? <span className="text-gray-400 text-xs font-normal ml-1">Escolha o foco do brandbook</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setScope(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                scope === opt.value
                  ? "border-gray-900 bg-gray-900 text-white shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
              }`}
            >
              <div className="text-xl mb-1">{opt.icon}</div>
              <div className={`font-bold text-sm ${scope === opt.value ? "text-white" : "text-gray-900"}`}>
                {opt.label}
              </div>
              <div className={`text-xs mt-1 leading-snug ${scope === opt.value ? "text-gray-300" : "text-gray-500"}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Creativity Level */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Nível de criatividade{" "}
          <span className="text-gray-400 text-xs font-normal ml-1">Como a IA deve se posicionar criativamente</span>
        </label>
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
          <div className={`mt-2 text-xs px-3 py-2 rounded-lg border ${selectedCreativity.color}`}>
            <strong>{selectedCreativity.icon} {selectedCreativity.label}:</strong>{" "}
            {creativity === "conservative" && "Paleta de no máximo 3 cores, formas limpas, tipografia com autoridade. Estilo IBM, Rolex, McKinsey."}
            {creativity === "creative" && "Cores inesperadas mas coesas, tipografia com personalidade forte. Estilo Spotify, Oatly, MailChimp."}
            {creativity === "experimental" && "Quebra de convenções intencional. Cult brand potential. Estilo Saul Bass, Paula Scher, Stefan Sagmeister."}
          </div>
        )}
      </div>

      {/* Intentionality Toggle */}
      <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <button
          type="button"
          role="switch"
          aria-checked={intentionality}
          aria-label="Alternar intenção e simbolismo"
          onClick={() => setIntentionality(!intentionality)}
          className={`mt-0.5 flex-shrink-0 w-12 h-6 rounded-full transition-colors relative ${
            intentionality ? "bg-amber-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              intentionality ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <div>
          <div className="font-semibold text-sm text-amber-900">
            ✨ Intenção &amp; Simbolismo
          </div>
          <div className="text-xs text-amber-800 mt-0.5">
            {intentionality
              ? "Ativado — a IA vai explicar o simbolismo de cada cor, forma, tipografia e elemento. Cada escolha terá um porquê filosófico e estratégico."
              : "Desativado — a IA gera sem explicar as razões por trás das escolhas. Ative para um brandbook com intenção narrativa profunda."}
          </div>
        </div>
      </div>

      {/* Guided Briefing */}
      <div className="border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuided(!showGuided)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">📋 Briefing Guiado</span>
            <span className="text-xs text-gray-500">
              {filledGuidedCount > 0
                ? `${filledGuidedCount} campo${filledGuidedCount > 1 ? "s" : ""} preenchido${filledGuidedCount > 1 ? "s" : ""}`
                : "Opcional — respostas geram um brandbook muito mais preciso"}
            </span>
          </div>
          <span className={`text-gray-400 transition-transform ${showGuided ? "rotate-180" : ""}`}>▼</span>
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
      <div>
        <label htmlFor="rawBriefing" className="block text-sm font-semibold mb-2">
          Briefing Livre{" "}
          <span className="text-gray-400 text-xs font-normal">
            (complementa o briefing guiado acima)
          </span>
        </label>
        <textarea
          id="rawBriefing"
          rows={4}
          value={rawBriefing}
          onChange={(e) => setRawBriefing(e.target.value)}
          placeholder="Qualquer detalhe extra, contexto histórico, inspirações, restrições, objetivos de negócio..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition resize-none"
        />
      </div>

      {/* Reference Images */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Imagens de Referência
          <span className="ml-2 text-xs font-normal text-gray-400">
            opcional — a IA analisa e replica estilo, paleta e composição
          </span>
        </label>
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
        className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-bold text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando com IA... (pode levar até 40s)
          </span>
        ) : (
          <>
            Gerar {SCOPE_OPTIONS.find((o) => o.value === scope)?.label}{" "}
            <span className="opacity-60 text-sm font-normal ml-1">
              · {selectedCreativity.icon} {selectedCreativity.label}
              {intentionality && " · ✨ Simbólico"}
            </span>
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
