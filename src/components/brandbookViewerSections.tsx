import { SectionApplications } from "./sections/SectionApplications";
import { SectionAssetPack } from "./sections/SectionAssetPack";
import { SectionAudiencePersonas } from "./sections/SectionAudiencePersonas";
import { SectionBrandAssets } from "./sections/SectionBrandAssets";
import { SectionBrandHealth } from "./sections/SectionBrandHealth";
import { SectionBrandStory } from "./sections/SectionBrandStory";
import { SectionBrandWorld } from "./sections/SectionBrandWorld";
import { SectionColors } from "./sections/SectionColors";
import { SectionDNA } from "./sections/SectionDNA";
import { SectionGovernance } from "./sections/SectionGovernance";
import { SectionKeyVisual } from "./sections/SectionKeyVisual";
import { SectionLogo } from "./sections/SectionLogo";
import { SectionMascots } from "./sections/SectionMascots";
import { SectionPositioning } from "./sections/SectionPositioning";
import { SectionProductionGuidelines } from "./sections/SectionProductionGuidelines";
import { SectionSocialMedia } from "./sections/SectionSocialMedia";
import { SectionTokensA11y } from "./sections/SectionTokensA11y";
import { SectionTypography } from "./sections/SectionTypography";
import { SectionTypographyScale } from "./sections/SectionTypographyScale";
import { SectionUiGuidelines } from "./sections/SectionUiGuidelines";
import { SectionUxMicrocopyMotion } from "./sections/SectionUxMicrocopyMotion";
import { SectionVerbalIdentity } from "./sections/SectionVerbalIdentity";
import type { AssetPackState, BrandbookData, Colors, GeneratedAsset, UploadedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

export type Category =
  | "Estratégia"
  | "Linguagem"
  | "Identidade Visual"
  | "Sistema Visual"
  | "Aplicações"
  | "Operacional";

export type SectionDef = {
  id: string;
  title: string;
  category: Category;
  when: boolean;
  render: (num: number) => JSX.Element;
};

export const CATEGORIES: Category[] = [
  "Estratégia",
  "Linguagem",
  "Identidade Visual",
  "Sistema Visual",
  "Aplicações",
  "Operacional",
];

/** Icon per category for UI display */
export const CATEGORY_ICONS: Record<Category, string> = {
  "Estratégia": "🧭",
  "Linguagem": "🗣️",
  "Identidade Visual": "🎨",
  "Sistema Visual": "✦",
  "Aplicações": "🖨️",
  "Operacional": "📋",
};

/** Short description per category */
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  "Estratégia": "Quem somos, para quem e por quê",
  "Linguagem": "Como a marca fala e se expressa",
  "Identidade Visual": "Logo, cores e tipografia",
  "Sistema Visual": "Mundo visual, key visuals e elementos",
  "Aplicações": "UI, mockups, redes sociais e uso real",
  "Operacional": "Produção, entrega e governança",
};

export type BrandbookViewerImageGenerationControls = {
  downloadImage: (url: string, name: string) => void;
  generate: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => void | Promise<void>;
  generateAllApplications: () => void | Promise<void>;
  generateApplication: (index: number, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9", customInstruction?: string, userReferenceImages?: string[], providerOverride?: import("@/lib/types").ImageProvider) => void | Promise<void>;
  loadingKey: string | null;
  saveGeneratedToAssets: (asset: GeneratedAsset, label: string, key?: AssetKey) => void | Promise<void>;
};

export function buildSectionDefs({
  assetPack,
  assetPackGenerating,
  data,
  generatedAssets,
  generatedImages,
  hasGeneration,
  imgGen,
  isAdvanced,
  onGenerateAssetPack,
  onUpdateApplicationImageKey,
  onUpdateColors,
  onUpdateData,
  uploadedAssets,
}: {
  assetPack: AssetPackState;
  assetPackGenerating: boolean;
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  generatedImages: Record<string, string>;
  hasGeneration: boolean;
  imgGen: BrandbookViewerImageGenerationControls;
  isAdvanced: boolean;
  onGenerateAssetPack?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  onUpdateColors?: (colors: Colors) => void;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
  uploadedAssets: UploadedAsset[];
}): SectionDef[] {
  return [
    {
      id: "dna",
      title: "DNA & Estratégia",
      category: "Estratégia",
      when: true,
      render: (num) => <SectionDNA data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "brand-story",
      title: "Brand Story & Manifesto",
      category: "Estratégia",
      when: !!data.brandStory,
      render: (num) => <SectionBrandStory data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "positioning",
      title: "Posicionamento",
      category: "Estratégia",
      when: !!data.positioning,
      render: (num) => <SectionPositioning data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "personas",
      title: "Personas",
      category: "Estratégia",
      when: !!data.audiencePersonas && data.audiencePersonas.length > 0,
      render: (num) => <SectionAudiencePersonas data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "verbal-identity",
      title: "Identidade Verbal",
      category: "Linguagem",
      when: !!data.verbalIdentity,
      render: (num) => <SectionVerbalIdentity data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "logo",
      title: "Logo & Identidade Visual",
      category: "Identidade Visual",
      when: true,
      render: (num) => (
        <SectionLogo
          data={data}
          num={num}
          generatedImages={generatedImages}
          uploadedAssets={uploadedAssets}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onSaveToAssets={hasGeneration ? (asset: GeneratedAsset, label: string, key?: AssetKey) => imgGen.saveGeneratedToAssets(asset, label, key) : undefined}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "colors",
      title: "Cores",
      category: "Identidade Visual",
      when: true,
      render: (num) => <SectionColors data={data} num={num} onUpdateColors={onUpdateColors} />,
    },
    {
      id: "typography",
      title: "Tipografia",
      category: "Identidade Visual",
      when: true,
      render: (num) => <SectionTypography data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "typography-scale",
      title: "Escala Tipográfica",
      category: "Identidade Visual",
      when: !!data.typographyScale && data.typographyScale.length > 0,
      render: (num) => <SectionTypographyScale data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "brand-world",
      title: "Mundo da Marca",
      category: "Sistema Visual",
      when: true,
      render: (num) => <SectionBrandWorld data={data} num={num} />,
    },
    {
      id: "key-visual",
      title: "Key Visual",
      category: "Sistema Visual",
      when: true,
      render: (num) => (
        <SectionKeyVisual
          data={data}
          num={num}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "mascots",
      title: "Mascotes & Símbolos",
      category: "Sistema Visual",
      when: !!(
        (data.keyVisual.mascots && data.keyVisual.mascots.length > 0) ||
        (data.keyVisual.symbols && data.keyVisual.symbols.length > 0) ||
        (data.keyVisual.patterns && data.keyVisual.patterns.length > 0) ||
        (data.keyVisual.structuredPatterns && data.keyVisual.structuredPatterns.length > 0) ||
        uploadedAssets.some((asset) => asset.type === "mascot" || asset.type === "element" || asset.type === "pattern")
      ),
      render: (num) => (
        <SectionMascots
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "ui-guidelines",
      title: "Guidelines de UI",
      category: "Aplicações",
      when: !!data.uiGuidelines,
      render: (num) => <SectionUiGuidelines data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "tokens-a11y",
      title: "Design Tokens & Acessibilidade",
      category: "Aplicações",
      when: isAdvanced && !!data.designTokens && !!data.accessibility,
      render: (num) => <SectionTokensA11y data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "ux-microcopy-motion",
      title: "UX Patterns, Microcopy & Motion",
      category: "Aplicações",
      when: isAdvanced && !!data.uxPatterns && !!data.microcopy && !!data.motion,
      render: (num) => <SectionUxMicrocopyMotion data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "applications",
      title: "Aplicações",
      category: "Aplicações",
      when: true,
      render: (num) => (
        <SectionApplications
          data={data}
          num={num}
          generatedImages={generatedImages}
          onUpdateApplicationImageKey={onUpdateApplicationImageKey}
          onGenerateApplication={hasGeneration ? (index: number, aspectRatio: string, customInstruction?: string, refs?: string[], providerOverride?) => imgGen.generateApplication(index, aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "21:9", customInstruction, refs, providerOverride) : undefined}
          onGenerateAllApplications={hasGeneration ? () => imgGen.generateAllApplications() : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "production-guidelines",
      title: "Produção & Handoff",
      category: "Operacional",
      when: !!data.productionGuidelines,
      render: (num) => <SectionProductionGuidelines data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "social-media",
      title: "Guia de Redes Sociais",
      category: "Aplicações",
      when: !!data.socialMediaGuidelines && data.socialMediaGuidelines.platforms.length > 0,
      render: (num) => <SectionSocialMedia data={data} num={num} />,
    },
    {
      id: "governance",
      title: "Governança do Design System",
      category: "Operacional",
      when: !!data.governance,
      render: (num) => <SectionGovernance data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "asset-pack",
      title: "Entrega — Asset Pack",
      category: "Operacional",
      when: true,
      render: (num) => (
        <SectionAssetPack
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          assetPack={assetPack}
          generating={assetPackGenerating}
          onGenerate={onGenerateAssetPack}
        />
      ),
    },
    {
      id: "brand-assets",
      title: "Ativos de Marca",
      category: "Operacional",
      when: uploadedAssets.length > 0,
      render: (num) => <SectionBrandAssets num={num} uploadedAssets={uploadedAssets} />,
    },
    {
      id: "brand-health",
      title: "Brand Health Dashboard",
      category: "Operacional",
      when: true,
      render: (num) => <SectionBrandHealth data={data} num={num} />,
    },
  ];
}
