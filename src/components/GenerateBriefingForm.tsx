"use client";

import { useState } from "react";
import type { GenerateScope, CreativityLevel, UploadedAsset } from "@/lib/types";
import {
  BasicInfoSection,
  CreativitySection,
  ExternalUrlsSection,
  FormErrorMessage,
  GuidedBriefingSection,
  LogoUploadSection,
  ProjectModeSection,
  ReferenceImagesSection,
  RawBriefingSection,
  ScopeSection,
  SubmitButton,
  ThinBriefingWarning,
} from "./GenerateBriefingFormSections";
import { prepareLogoUpload } from "./generateBriefingFormLogo";
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
  initialBrandName?: string;
  initialIndustry?: string;
  initialBriefing?: string;
  initialScope?: GenerateScope;
  initialCreativity?: CreativityLevel;
  initialGuidedBriefing?: Partial<GuidedBriefing>;
  templateName?: string;
}

export function GenerateBriefingForm({
  onSubmit,
  loading,
  error,
  initialBrandName,
  initialIndustry,
  initialBriefing,
  initialScope,
  initialCreativity,
  initialGuidedBriefing,
  templateName,
}: Props) {
  const [brandName, setBrandName] = useState(initialBrandName ?? "");
  const [industry, setIndustry] = useState(initialIndustry ?? "");
  const [rawBriefing, setRawBriefing] = useState(initialBriefing ?? "");
  const [externalUrlsRaw, setExternalUrlsRaw] = useState("");
  const [projectMode, setProjectMode] = useState<ProjectMode>("new_brand");
  const [scope, setScope] = useState<GenerateScope>(initialScope ?? "full");
  const [creativity, setCreativity] = useState<CreativityLevel>(initialCreativity ?? "balanced");
  const intentionality = true; // Always-on: semiotic analysis is now always active
  const [showGuided, setShowGuided] = useState(!!initialGuidedBriefing);
  const [referenceImages, setReferenceImages] = useState<UploadedAsset[]>([]);
  const [logoImage, setLogoImage] = useState<UploadedAsset | null>(null);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [logoDragActive, setLogoDragActive] = useState(false);
  const [guided, setGuided] = useState<GuidedBriefing>({
    ...createEmptyGuidedBriefing(),
    ...initialGuidedBriefing,
  });

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

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const canAdvance = step === 1 ? (!!brandName.trim() && !!industry.trim()) : true;
  function nextStep() { if (canAdvance && step < totalSteps) setStep(step + 1); }
  function prevStep() { if (step > 1) setStep(step - 1); }

  const hasAnyBriefingContent = !!rawBriefing.trim() || filledGuidedCount > 0;
  const hasVisualInput = !!logoImage || referenceImages.length > 0;
  const isBriefingThin = !hasAnyBriefingContent && !hasVisualInput;

  async function setLogoFromFile(file: File) {
    setLogoUploadError("");

    const result = await prepareLogoUpload(file);

    if (result.error || !result.logoImage) {
      setLogoUploadError(result.error);
      return;
    }

    setProjectMode("rebrand");
    setLogoImage(result.logoImage);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: "Sua Marca" },
          { num: 2, label: "Briefing" },
          { num: 3, label: "Gerar" },
        ].map(({ num, label }) => (
          <button
            key={num}
            type="button"
            onClick={() => { if (num < step || canAdvance) setStep(num); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              step === num
                ? "bg-gray-900 text-white shadow-md"
                : num < step
                  ? "bg-violet-50 text-violet-600 hover:bg-violet-100"
                  : "bg-gray-50 text-gray-300"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === num ? "bg-white/20" : num < step ? "bg-violet-200 text-violet-700" : "bg-gray-100"
            }`}>
              {num < step ? "\u2713" : num}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] font-bold text-gray-300 tabular-nums">
          {step}/{totalSteps}
        </span>
      </div>

      {/* Step divider line */}
      <div className="h-0.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(step / totalSteps) * 100}%`,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          }}
        />
      </div>

      {templateName && step === 1 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-xl">
          <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 8.25 20.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z" />
          </svg>
          <span className="text-sm font-medium text-violet-700">
            Usando template: {templateName}
          </span>
          <span className="text-[10px] text-violet-400 ml-auto">Campos pre-preenchidos — edite como quiser</span>
        </div>
      )}

      {/* STEP 1: Sua Marca */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in-up">
          <LogoUploadSection
            logoDragActive={logoDragActive}
            logoImage={logoImage}
            logoUploadError={logoUploadError}
            onDragEnter={() => setLogoDragActive(true)}
            onDragLeave={() => setLogoDragActive(false)}
            onDrop={handleLogoDrop}
            onFileChange={handleLogoUpload}
            onRemoveLogo={() => setLogoImage(null)}
          />

          <BasicInfoSection
            brandName={brandName}
            industry={industry}
            onBrandNameChange={setBrandName}
            onIndustryChange={setIndustry}
          />

          <ProjectModeSection projectMode={projectMode} onChange={setProjectMode} />
        </div>
      )}

      {/* STEP 2: Briefing */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in-up">
          <GuidedBriefingSection
            showGuided={showGuided}
            filledGuidedCount={filledGuidedCount}
            guided={guided}
            onToggle={() => setShowGuided(!showGuided)}
            onUpdate={updateGuided}
          />

          <RawBriefingSection value={rawBriefing} onChange={setRawBriefing} />

          <ExternalUrlsSection value={externalUrlsRaw} onChange={setExternalUrlsRaw} />

          <ReferenceImagesSection images={referenceImages} onChange={setReferenceImages} />
        </div>
      )}

      {/* STEP 3: Configuracao & Gerar */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in-up">
          <ScopeSection scope={scope} onChange={setScope} />

          <CreativitySection creativity={creativity} onChange={setCreativity} />

          {isBriefingThin && brandName && industry && <ThinBriefingWarning />}

          {error && <FormErrorMessage error={error} />}

          <SubmitButton loading={loading} />
        </div>
      )}

      {/* Step navigation */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Voltar
          </button>
        ) : <div />}

        {step < totalSteps && (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canAdvance}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: canAdvance ? "linear-gradient(135deg, #111827 0%, #3730a3 100%)" : "#d1d5db",
              boxShadow: canAdvance ? "0 12px 24px -8px rgba(55, 48, 163, 0.4)" : "none",
            }}
          >
            Proximo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        )}
      </div>
    </form>
  );
}
