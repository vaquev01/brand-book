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
      {templateName && (
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

      <ReferenceImagesSection images={referenceImages} onChange={setReferenceImages} />

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
