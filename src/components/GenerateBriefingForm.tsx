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
}

export function GenerateBriefingForm({ onSubmit, loading, error }: Props) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [rawBriefing, setRawBriefing] = useState("");
  const [externalUrlsRaw, setExternalUrlsRaw] = useState("");
  const [projectMode, setProjectMode] = useState<ProjectMode>("new_brand");
  const [scope, setScope] = useState<GenerateScope>("full");
  const [creativity, setCreativity] = useState<CreativityLevel>("balanced");
  const intentionality = true; // Always-on: semiotic analysis is now always active
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
