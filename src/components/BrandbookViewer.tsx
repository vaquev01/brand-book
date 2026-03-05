"use client";

import { BrandbookData, UploadedAsset, GeneratedAsset, Colors } from "@/lib/types";
import { SectionCover } from "./sections/SectionCover";
import { SectionDNA } from "./sections/SectionDNA";
import { SectionLogo } from "./sections/SectionLogo";
import { SectionColors } from "./sections/SectionColors";
import { SectionTypography } from "./sections/SectionTypography";
import { SectionTokensA11y } from "./sections/SectionTokensA11y";
import { SectionUxMicrocopyMotion } from "./sections/SectionUxMicrocopyMotion";
import { SectionKeyVisual } from "./sections/SectionKeyVisual";
import { SectionMascots } from "./sections/SectionMascots";
import { SectionApplications } from "./sections/SectionApplications";
import { SectionPositioning } from "./sections/SectionPositioning";
import { SectionAudiencePersonas } from "./sections/SectionAudiencePersonas";
import { SectionVerbalIdentity } from "./sections/SectionVerbalIdentity";
import { SectionTypographyScale } from "./sections/SectionTypographyScale";
import { SectionUiGuidelines } from "./sections/SectionUiGuidelines";
import { SectionProductionGuidelines } from "./sections/SectionProductionGuidelines";
import { SectionBrandStory } from "./sections/SectionBrandStory";
import { SectionSocialMedia } from "./sections/SectionSocialMedia";
import { SectionAssetPack } from "./sections/SectionAssetPack";
import { SectionBrandAssets } from "./sections/SectionBrandAssets";
import { FontLoader } from "./FontLoader";
import { useImageGeneration, PROVIDERS } from "@/hooks/useImageGeneration";
import { EMPTY_KEYS } from "@/components/ApiKeyConfig";
import type { AssetKey } from "@/lib/imagePrompts";
import type { AssetPackFile } from "@/lib/types";
import type { ApiKeys } from "@/components/ApiKeyConfig";

type Category =
  | "Essência da Marca"
  | "Público-Alvo"
  | "Identidade Verbal"
  | "Identidade Visual"
  | "Paleta de Cores"
  | "Tipografia"
  | "Sistema Visual"
  | "Padrões Gráficos"
  | "Design System"
  | "Aplicações da Marca"
  | "Diretrizes de Uso";

type SectionDef = {
  id: string;
  title: string;
  category: Category;
  when: boolean;
  render: (num: number) => JSX.Element;
};

interface Props {
  data: BrandbookData;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  assetPackFiles?: AssetPackFile[];
  assetPackGenerating?: boolean;
  onGenerateAssetPack?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  generatedAssets?: Record<string, GeneratedAsset>;
  apiKeys?: ApiKeys;
  textProvider?: "openai" | "gemini";
  onAssetGenerated?: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  onUpdateColors?: (colors: Colors) => void;
}

export function BrandbookViewer({
  data,
  generatedImages = {},
  uploadedAssets = [],
  assetPackFiles = [],
  assetPackGenerating = false,
  onGenerateAssetPack,
  onUpdateApplicationImageKey,
  generatedAssets = {},
  apiKeys,
  textProvider = "openai",
  onAssetGenerated,
  onSaveToAssets,
  onUpdateColors,
}: Props) {
  const isAdvanced = !!data.uxPatterns;
  const hasGeneration = !!apiKeys && !!onAssetGenerated;

  const noop = () => {};
  const imgGen = useImageGeneration({
    data,
    generatedAssets,
    onAssetGenerated: onAssetGenerated ?? noop,
    onSaveToAssets,
    apiKeys: apiKeys ?? EMPTY_KEYS,
    uploadedAssets,
    textProvider,
  });

  const sectionDefs: SectionDef[] = [
    {
      id: "dna",
      title: "DNA & Estratégia",
      category: "Essência da Marca",
      when: true,
      render: (num) => <SectionDNA data={data} num={num} />,
    },
    {
      id: "brand-story",
      title: "Brand Story & Manifesto",
      category: "Essência da Marca",
      when: !!data.brandStory,
      render: (num) => <SectionBrandStory data={data} num={num} />,
    },
    {
      id: "positioning",
      title: "Posicionamento",
      category: "Essência da Marca",
      when: !!data.positioning,
      render: (num) => <SectionPositioning data={data} num={num} />,
    },
    {
      id: "personas",
      title: "Personas",
      category: "Público-Alvo",
      when: !!data.audiencePersonas && data.audiencePersonas.length > 0,
      render: (num) => <SectionAudiencePersonas data={data} num={num} />,
    },
    {
      id: "verbal-identity",
      title: "Identidade Verbal",
      category: "Identidade Verbal",
      when: !!data.verbalIdentity,
      render: (num) => <SectionVerbalIdentity data={data} num={num} />,
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
          onGenerate={hasGeneration ? (key: AssetKey) => imgGen.generate(key) : undefined}
          loadingKey={imgGen.loadingKey}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onSaveToAssets={hasGeneration ? (asset: GeneratedAsset, label: string, key?: AssetKey) => imgGen.saveGeneratedToAssets(asset, label, key) : undefined}
          generatedAssets={generatedAssets}
        />
      ),
    },
    {
      id: "colors",
      title: "Cores",
      category: "Paleta de Cores",
      when: true,
      render: (num) => (
        <SectionColors
          data={data}
          num={num}
          onUpdateColors={onUpdateColors}
        />
      ),
    },
    {
      id: "typography",
      title: "Tipografia",
      category: "Tipografia",
      when: true,
      render: (num) => <SectionTypography data={data} num={num} />,
    },
    {
      id: "typography-scale",
      title: "Escala Tipográfica",
      category: "Tipografia",
      when: !!data.typographyScale && data.typographyScale.length > 0,
      render: (num) => <SectionTypographyScale data={data} num={num} />,
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
          onGenerate={hasGeneration ? (key: AssetKey) => imgGen.generate(key) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
        />
      ),
    },
    {
      id: "mascots",
      title: "Mascotes & Símbolos",
      category: "Padrões Gráficos",
      when: !!(
        (data.keyVisual.mascots && data.keyVisual.mascots.length > 0) ||
        (data.keyVisual.symbols && data.keyVisual.symbols.length > 0) ||
        (data.keyVisual.patterns && data.keyVisual.patterns.length > 0) ||
        (data.keyVisual.structuredPatterns && data.keyVisual.structuredPatterns.length > 0) ||
        uploadedAssets.some((a) => a.type === "mascot" || a.type === "element" || a.type === "pattern")
      ),
      render: (num) => (
        <SectionMascots
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey) => imgGen.generate(key) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
        />
      ),
    },
    {
      id: "ui-guidelines",
      title: "Guidelines de UI",
      category: "Design System",
      when: !!data.uiGuidelines,
      render: (num) => <SectionUiGuidelines data={data} num={num} />,
    },
    {
      id: "tokens-a11y",
      title: "Design Tokens & Acessibilidade",
      category: "Design System",
      when: isAdvanced && !!data.designTokens && !!data.accessibility,
      render: (num) => <SectionTokensA11y data={data} num={num} />,
    },
    {
      id: "ux-microcopy-motion",
      title: "UX Patterns, Microcopy & Motion",
      category: "Design System",
      when: isAdvanced && !!data.uxPatterns && !!data.microcopy && !!data.motion,
      render: (num) => <SectionUxMicrocopyMotion data={data} num={num} />,
    },
    {
      id: "applications",
      title: "Aplicações",
      category: "Aplicações da Marca",
      when: true,
      render: (num) => (
        <SectionApplications
          data={data}
          num={num}
          generatedImages={generatedImages}
          onUpdateApplicationImageKey={onUpdateApplicationImageKey}
          onGenerateApplication={hasGeneration ? (i: number, ar: string, ci?: string, refs?: string[]) => imgGen.generateApplication(i, ar as "1:1" | "16:9" | "9:16" | "4:3" | "21:9", ci, refs) : undefined}
          onGenerateAllApplications={hasGeneration ? () => imgGen.generateAllApplications() : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
        />
      ),
    },
    {
      id: "production-guidelines",
      title: "Produção & Handoff",
      category: "Diretrizes de Uso",
      when: !!data.productionGuidelines,
      render: (num) => <SectionProductionGuidelines data={data} num={num} />,
    },
    {
      id: "social-media",
      title: "Guia de Redes Sociais",
      category: "Aplicações da Marca",
      when: !!data.socialMediaGuidelines && data.socialMediaGuidelines.platforms.length > 0,
      render: (num) => <SectionSocialMedia data={data} num={num} />,
    },
    {
      id: "asset-pack",
      title: "Entrega — Asset Pack",
      category: "Diretrizes de Uso",
      when: true,
      render: (num) => (
        <SectionAssetPack
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          assetPackFiles={assetPackFiles}
          generating={assetPackGenerating}
          onGenerate={onGenerateAssetPack}
        />
      ),
    },
    {
      id: "brand-assets",
      title: "Ativos de Marca",
      category: "Diretrizes de Uso",
      when: uploadedAssets.length > 0,
      render: (num) => (
        <SectionBrandAssets
          num={num}
          uploadedAssets={uploadedAssets}
        />
      ),
    },
  ];

  const sections = sectionDefs
    .filter((s) => s.when)
    .map((s, idx) => ({ ...s, num: idx + 1 }));

  const categories: Category[] = [
    "Essência da Marca",
    "Público-Alvo",
    "Identidade Verbal",
    "Identidade Visual",
    "Paleta de Cores",
    "Tipografia",
    "Sistema Visual",
    "Padrões Gráficos",
    "Design System",
    "Aplicações da Marca",
    "Diretrizes de Uso",
  ];

  const byCategory = categories
    .map((cat) => ({
      cat,
      items: sections.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="brandbook-content">
      <FontLoader data={data} />
      <SectionCover data={data} />

      {/* Generation Control Bar */}
      {hasGeneration && (
        <div className="no-print sticky top-20 z-30 bg-white/95 backdrop-blur border rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Provider:</span>
              <select
                value={imgGen.provider}
                onChange={(e) => imgGen.setProvider(e.target.value as "dalle3" | "stability" | "ideogram" | "imagen")}
                className="text-sm font-semibold border rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-gray-900 outline-none"
                aria-label="Provider de imagem"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {!imgGen.currentProviderHasKey && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Sem chave</span>
              )}
            </div>

            <div className="flex items-center gap-3 border-l pl-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={imgGen.refineBeforeGenerate} onChange={(e) => imgGen.setRefineBeforeGenerate(e.target.checked)} className="rounded" />
                <span className="font-medium">Refinar prompt</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={imgGen.useReferenceImages} onChange={(e) => imgGen.setUseReferenceImages(e.target.checked)} className="rounded" />
                <span className="font-medium">Referências</span>
              </label>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => imgGen.generateAllAssets()}
                disabled={imgGen.loadingKey !== null}
                className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {imgGen.loadingKey ? "Gerando..." : "✦ Gerar Todos os Assets"}
              </button>
              {imgGen.loadingKey && (
                <button
                  type="button"
                  onClick={() => imgGen.cancelBatch()}
                  className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {imgGen.error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
              <span>{imgGen.error}</span>
              <button onClick={() => imgGen.setError(null)} className="font-bold text-lg leading-none ml-3">&times;</button>
            </div>
          )}
        </div>
      )}

      <section className="page-break mb-10" id="sumario">
        <div className="mb-4 border-b border-gray-100 pb-2">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Sumário</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Navegue por categorias e vá direto à seção desejada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {byCategory.map((g) => (
            <div key={g.cat} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-[0.25em] mb-3">
                {g.cat}
              </h3>
              <div className="space-y-2">
                {g.items.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gray-400 mt-0.5 tabular-nums">
                        {String(s.num).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-gray-900 leading-snug">{s.title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {byCategory.map((g) => (
        <div key={g.cat}>
          <div className="page-break mb-4 mt-10">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-gray-500">{g.cat}</h2>
              <a href="#sumario" className="no-print text-sm font-semibold text-gray-600 hover:text-gray-900">
                Voltar ao sumário
              </a>
            </div>
          </div>
          {g.items.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-24">
              {s.render(s.num)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
