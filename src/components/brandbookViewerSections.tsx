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
  | "Linguagem & Tipografia"
  | "Identidade Visual"
  | "Sistema Visual"
  | "Aplicações"
  | "Assets"
  | "Para Devs & Designers";

export type SectionDef = {
  id: string;
  title: string;
  category: Category;
  when: boolean;
  render: (num: number) => JSX.Element;
};

export const CATEGORIES: Category[] = [
  "Estratégia",
  "Linguagem & Tipografia",
  "Identidade Visual",
  "Sistema Visual",
  "Aplicações",
  "Assets",
  "Para Devs & Designers",
];

/** Categories that start collapsed by default */
export const DEFAULT_COLLAPSED_CATEGORIES: Category[] = [
  "Para Devs & Designers",
];

/** Icon per category for UI display */
export const CATEGORY_ICONS: Record<Category, string> = {
  "Estratégia": "🧭",
  "Linguagem & Tipografia": "🗣️",
  "Identidade Visual": "🎨",
  "Sistema Visual": "✦",
  "Aplicações": "🖨️",
  "Assets": "📦",
  "Para Devs & Designers": "⚙️",
};

/** Short description per category */
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  "Estratégia": "Quem somos, para quem e por quê",
  "Linguagem & Tipografia": "Voz, tom, tipografia e redes sociais",
  "Identidade Visual": "Cores, logo e mundo visual",
  "Sistema Visual": "Key visuals, mascotes e padrões",
  "Aplicações": "Mockups, materiais e uso real",
  "Assets": "Pacote de entrega e ativos da marca",
  "Para Devs & Designers": "Tokens, guidelines, governança e produção",
};

export type BrandbookViewerImageGenerationControls = {
  downloadImage: (url: string, name: string) => void;
  generate: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => void | Promise<void>;
  generateAllApplications: () => void | Promise<void>;
  generateApplication: (index: number, aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9", customInstruction?: string, userReferenceImages?: string[], providerOverride?: import("@/lib/types").ImageProvider) => void | Promise<void>;
  uploadForKey: (key: AssetKey, file: File) => void | Promise<void>;
  duplicateAsset: (sourceKey: AssetKey, targetKey: AssetKey) => void;
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
  onAssetGenerated,
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
  onAssetGenerated?: (key: string, asset: GeneratedAsset) => void;
  onGenerateAssetPack?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  onUpdateColors?: (colors: Colors) => void;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
  uploadedAssets: UploadedAsset[];
}): SectionDef[] {
  return [
    // ── Estratégia (conciso, estilo PPT) ──
    {
      id: "dna",
      title: "DNA & Estratégia",
      category: "Estratégia" as Category,
      when: true,
      render: (num: number) => <SectionDNA data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "positioning",
      title: "Posicionamento",
      category: "Estratégia" as Category,
      when: !!data.positioning,
      render: (num: number) => <SectionPositioning data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "brand-story",
      title: "Brand Story & Manifesto",
      category: "Estratégia" as Category,
      when: !!data.brandStory,
      render: (num: number) => <SectionBrandStory data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "personas",
      title: "Personas",
      category: "Estratégia" as Category,
      when: !!data.audiencePersonas && data.audiencePersonas.length > 0,
      render: (num: number) => <SectionAudiencePersonas data={data} num={num} onUpdateData={onUpdateData} />,
    },

    // ── Linguagem & Tipografia (verbal + tipo + social media) ──
    {
      id: "verbal-identity",
      title: "Identidade Verbal",
      category: "Linguagem & Tipografia" as Category,
      when: !!data.verbalIdentity,
      render: (num: number) => <SectionVerbalIdentity data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "typography",
      title: "Tipografia",
      category: "Linguagem & Tipografia" as Category,
      when: true,
      render: (num: number) => <SectionTypography data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "typography-scale",
      title: "Escala Tipográfica",
      category: "Linguagem & Tipografia" as Category,
      when: !!data.typographyScale && data.typographyScale.length > 0,
      render: (num: number) => <SectionTypographyScale data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "social-media",
      title: "Guia de Redes Sociais",
      category: "Linguagem & Tipografia" as Category,
      when: !!data.socialMediaGuidelines && data.socialMediaGuidelines.platforms.length > 0,
      render: (num: number) => <SectionSocialMedia data={data} num={num} onUpdateData={onUpdateData} />,
    },

    // ── Identidade Visual (cores com WCAG + logo seguindo regras de cores) ──
    {
      id: "colors",
      title: "Cores & Matriz WCAG",
      category: "Identidade Visual" as Category,
      when: true,
      render: (num: number) => <SectionColors data={data} num={num} onUpdateColors={onUpdateColors} />,
    },
    {
      id: "logo",
      title: "Logo & Aplicações de Marca",
      category: "Identidade Visual" as Category,
      when: true,
      render: (num: number) => (
        <SectionLogo
          data={data}
          num={num}
          generatedImages={generatedImages}
          uploadedAssets={uploadedAssets}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          onUploadForKey={hasGeneration ? (key: AssetKey, file: File) => imgGen.uploadForKey(key, file) : undefined}
          onDuplicateAsset={hasGeneration ? (s: AssetKey, t: AssetKey) => imgGen.duplicateAsset(s, t) : undefined}
          loadingKey={imgGen.loadingKey}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onSaveToAssets={hasGeneration ? (asset: GeneratedAsset, label: string, key?: AssetKey) => imgGen.saveGeneratedToAssets(asset, label, key) : undefined}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
        />
      ),
    },

    // ── Sistema Visual (mundo da marca, key visuals, mascotes) ──
    {
      id: "brand-world",
      title: "Mundo da Marca",
      category: "Sistema Visual" as Category,
      when: true,
      render: (num: number) => <SectionBrandWorld data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "key-visual",
      title: "Key Visual",
      category: "Sistema Visual" as Category,
      when: true,
      render: (num: number) => (
        <SectionKeyVisual
          data={data}
          num={num}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          onUploadForKey={hasGeneration ? (key: AssetKey, file: File) => imgGen.uploadForKey(key, file) : undefined}
          onDuplicateAsset={hasGeneration ? (s: AssetKey, t: AssetKey) => imgGen.duplicateAsset(s, t) : undefined}
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
      category: "Sistema Visual" as Category,
      when: !!(
        (data.keyVisual.mascots && data.keyVisual.mascots.length > 0) ||
        (data.keyVisual.symbols && data.keyVisual.symbols.length > 0) ||
        (data.keyVisual.patterns && data.keyVisual.patterns.length > 0) ||
        (data.keyVisual.structuredPatterns && data.keyVisual.structuredPatterns.length > 0) ||
        uploadedAssets.some((asset) => asset.type === "mascot" || asset.type === "element" || asset.type === "pattern")
      ),
      render: (num: number) => (
        <SectionMascots
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          onUploadForKey={hasGeneration ? (key: AssetKey, file: File) => imgGen.uploadForKey(key, file) : undefined}
          onDuplicateAsset={hasGeneration ? (s: AssetKey, t: AssetKey) => imgGen.duplicateAsset(s, t) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onUpdateData={onUpdateData}
        />
      ),
    },

    // ── Aplicações (mockups e uso real) ──
    {
      id: "applications",
      title: "Aplicações",
      category: "Aplicações" as Category,
      when: true,
      render: (num: number) => (
        <SectionApplications
          data={data}
          num={num}
          generatedImages={generatedImages}
          onGenerateApplication={hasGeneration ? (index: number, aspectRatio: string, customInstruction?: string, refs?: string[], providerOverride?) => imgGen.generateApplication(index, aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "21:9", customInstruction, refs, providerOverride) : undefined}
          onGenerateAllApplications={hasGeneration ? () => imgGen.generateAllApplications() : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
          onAssetGenerated={onAssetGenerated}
        />
      ),
    },

    // ── Assets (pacote de entrega) ──
    {
      id: "asset-pack",
      title: "Entrega — Asset Pack",
      category: "Assets" as Category,
      when: true,
      render: (num: number) => (
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
      category: "Assets" as Category,
      when: uploadedAssets.length > 0,
      render: (num: number) => <SectionBrandAssets num={num} uploadedAssets={uploadedAssets} />,
    },

    // ── Para Devs & Designers (colapsado por padrão) ──
    {
      id: "ui-guidelines",
      title: "Guidelines de UI",
      category: "Para Devs & Designers" as Category,
      when: !!data.uiGuidelines,
      render: (num: number) => <SectionUiGuidelines data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "tokens-a11y",
      title: "Design Tokens & Acessibilidade",
      category: "Para Devs & Designers" as Category,
      when: isAdvanced && !!data.designTokens && !!data.accessibility,
      render: (num: number) => <SectionTokensA11y data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "ux-microcopy-motion",
      title: "UX Patterns, Microcopy & Motion",
      category: "Para Devs & Designers" as Category,
      when: isAdvanced && !!data.uxPatterns && !!data.microcopy && !!data.motion,
      render: (num: number) => <SectionUxMicrocopyMotion data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "production-guidelines",
      title: "Produção & Handoff",
      category: "Para Devs & Designers" as Category,
      when: !!data.productionGuidelines,
      render: (num: number) => <SectionProductionGuidelines data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "governance",
      title: "Governança do Design System",
      category: "Para Devs & Designers" as Category,
      when: !!data.governance,
      render: (num: number) => <SectionGovernance data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "brand-health",
      title: "Brand Health Dashboard",
      category: "Para Devs & Designers" as Category,
      when: true,
      render: (num: number) => <SectionBrandHealth data={data} num={num} />,
    },
  ];
}
