"use client";

import { useState } from "react";
import { BriefingImageUpload } from "./BriefingImageUpload";
import type { GenerateScope, CreativityLevel, UploadedAsset } from "@/lib/types";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";
import {
  BasicInfoSection,
  CreativitySection,
  ExternalUrlsSection,
  FormErrorMessage,
  GuidedBriefingSection,
  IntentionalityToggle,
  ProjectModeSection,
  RawBriefingSection,
  ScopeSection,
  SubmitButton,
  ThinBriefingWarning,
} from "./GenerateBriefingFormSections";
import {
  composeBriefing,
  countFilledGuidedFields,
  createEmptyGuidedBriefing,
  parseExternalUrls,
  type GenerateBriefingData,
  type GuidedBriefing,
  type ProjectMode,
} from "./generateBriefingFormModel";

export type { GenerateBriefingData } from "./generateBriefingFormModel";

interface Props {
  onSubmit: (data: GenerateBriefingData) => void;
  loading: boolean;
  error: string;
}

export function GenerateBriefingForm({ onSubmit, loading, error }: Props) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [rawBriefing, setRawBriefing] = useState("");
  const [externalUrlsRaw, setExternalUrlsRaw] = useState("");
  const [projectMode, setProjectMode] = useState<ProjectMode>("new_brand");
  const [scope, setScope] = useState<GenerateScope>("full");
  const [creativity, setCreativity] = useState<CreativityLevel>("balanced");
  const [intentionality, setIntentionality] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [referenceImages, setReferenceImages] = useState<UploadedAsset[]>([]);
  const [logoImage, setLogoImage] = useState<UploadedAsset | null>(null);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [logoDragActive, setLogoDragActive] = useState(false);
  const [guided, setGuided] = useState<GuidedBriefing>(createEmptyGuidedBriefing());

  function updateGuided(field: keyof GuidedBriefing, value: string | boolean) {
    setGuided((prev) => ({ ...prev, [field]: value }));
  }

  const filledGuidedCount = countFilledGuidedFields(guided);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalBriefing = composeBriefing(guided, rawBriefing);
    const externalUrls = parseExternalUrls(externalUrlsRaw);

    onSubmit({
      brandName,
      industry,
      briefing: finalBriefing,
      externalUrls: externalUrls.length > 0 ? externalUrls : undefined,
      projectMode,
      scope,
      creativityLevel: creativity,
      intentionality,
      referenceImages,
      logoImage: logoImage ?? undefined,
    });
  }

  const hasAnyBriefingContent = !!rawBriefing.trim() || filledGuidedCount > 0;
  const isBriefingThin = !hasAnyBriefingContent && !logoImage;

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

      setProjectMode("rebrand");
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
      <BasicInfoSection
        brandName={brandName}
        industry={industry}
        onBrandNameChange={setBrandName}
        onIndustryChange={setIndustry}
      />

      {/* Project Mode */}
      <ProjectModeSection projectMode={projectMode} onChange={setProjectMode} />

      {/* Scope */}
      <ScopeSection scope={scope} onChange={setScope} />

      {/* Creativity Level */}
      <CreativitySection creativity={creativity} onChange={setCreativity} />

      {/* Intentionality Toggle */}
      <IntentionalityToggle intentionality={intentionality} onToggle={() => setIntentionality(!intentionality)} />

      {/* Guided Briefing */}
      <GuidedBriefingSection
        showGuided={showGuided}
        filledGuidedCount={filledGuidedCount}
        guided={guided}
        onToggle={() => setShowGuided(!showGuided)}
        onUpdate={updateGuided}
      />

      {/* Raw Briefing */}
      <RawBriefingSection value={rawBriefing} onChange={setRawBriefing} />

      <ExternalUrlsSection value={externalUrlsRaw} onChange={setExternalUrlsRaw} />

      {/* Reference Images */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-images text-gray-400"><path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/></svg>
          <div>
            <h3 className="font-bold text-gray-900">Imagens de Referência</h3>
            <p className="text-xs text-gray-500 mt-0.5">Opcional — envie tanto capturas da marca atual quanto imagens aspiracionais para a IA separar equity atual de direção futura</p>
          </div>
        </div>
        <BriefingImageUpload images={referenceImages} onChange={setReferenceImages} />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Dica: para <strong>rebrand</strong>, misture screenshots do Instagram/feed/fachada/embalagens atuais com referências do conceito desejado. A IA deve entender o que já existe hoje e o que deve evoluir.
        </p>
      </div>

      {/* Thin briefing warning */}
      {isBriefingThin && brandName && industry && (
        <ThinBriefingWarning />
      )}

      {/* Error */}
      {error && <FormErrorMessage error={error} />}

      {/* Submit */}
      <SubmitButton loading={loading} />
    </form>
  );
}
