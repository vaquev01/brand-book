"use client";

import { BrandbookData, UploadedAsset } from "@/lib/types";
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
import { SectionLogoVariants } from "./sections/SectionLogoVariants";
import { SectionTypographyScale } from "./sections/SectionTypographyScale";
import { SectionUiGuidelines } from "./sections/SectionUiGuidelines";
import { SectionProductionGuidelines } from "./sections/SectionProductionGuidelines";
import { SectionBrandStory } from "./sections/SectionBrandStory";
import { SectionSocialMedia } from "./sections/SectionSocialMedia";
import { FontLoader } from "./FontLoader";
import type { AssetKey } from "@/lib/imagePrompts";

type Category =
  | "Estratégia"
  | "Identidade Visual"
  | "Design System"
  | "Produto & UX"
  | "Ativos & Entrega";

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
  onGoToImages?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
}

export function BrandbookViewer({ data, generatedImages = {}, uploadedAssets = [], onGoToImages, onUpdateApplicationImageKey }: Props) {
  const isAdvanced = !!data.uxPatterns;

  const sectionDefs: SectionDef[] = [
    {
      id: "dna",
      title: "DNA & Estratégia",
      category: "Estratégia",
      when: true,
      render: (num) => <SectionDNA data={data} num={num} />,
    },
    {
      id: "brand-story",
      title: "Brand Story & Manifesto",
      category: "Estratégia",
      when: !!data.brandStory,
      render: (num) => <SectionBrandStory data={data} num={num} />,
    },
    {
      id: "positioning",
      title: "Posicionamento",
      category: "Estratégia",
      when: !!data.positioning,
      render: (num) => <SectionPositioning data={data} num={num} />,
    },
    {
      id: "personas",
      title: "Personas",
      category: "Estratégia",
      when: !!data.audiencePersonas && data.audiencePersonas.length > 0,
      render: (num) => <SectionAudiencePersonas data={data} num={num} />,
    },
    {
      id: "verbal-identity",
      title: "Identidade Verbal",
      category: "Estratégia",
      when: !!data.verbalIdentity,
      render: (num) => <SectionVerbalIdentity data={data} num={num} />,
    },

    {
      id: "logo",
      title: "Logo",
      category: "Identidade Visual",
      when: true,
      render: (num) => <SectionLogo data={data} num={num} />,
    },
    {
      id: "logo-variants",
      title: "Variações de Logo",
      category: "Identidade Visual",
      when: !!data.logoVariants,
      render: (num) => <SectionLogoVariants data={data} num={num} />,
    },
    {
      id: "colors",
      title: "Cores",
      category: "Identidade Visual",
      when: true,
      render: (num) => <SectionColors data={data} num={num} />,
    },
    {
      id: "typography",
      title: "Tipografia",
      category: "Identidade Visual",
      when: true,
      render: (num) => <SectionTypography data={data} num={num} />,
    },

    {
      id: "typography-scale",
      title: "Escala Tipográfica",
      category: "Design System",
      when: !!data.typographyScale && data.typographyScale.length > 0,
      render: (num) => <SectionTypographyScale data={data} num={num} />,
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
      category: "Produto & UX",
      when: isAdvanced && !!data.uxPatterns && !!data.microcopy && !!data.motion,
      render: (num) => <SectionUxMicrocopyMotion data={data} num={num} />,
    },

    {
      id: "key-visual",
      title: "Key Visual",
      category: "Ativos & Entrega",
      when: true,
      render: (num) => <SectionKeyVisual data={data} num={num} />,
    },
    {
      id: "mascots",
      title: "Mascotes & Símbolos",
      category: "Ativos & Entrega",
      when: !!(
        (data.keyVisual.mascots && data.keyVisual.mascots.length > 0) ||
        (data.keyVisual.symbols && data.keyVisual.symbols.length > 0) ||
        (data.keyVisual.patterns && data.keyVisual.patterns.length > 0) ||
        (data.keyVisual.structuredPatterns && data.keyVisual.structuredPatterns.length > 0) ||
        uploadedAssets.some((a) => a.type === "mascot" || a.type === "element" || a.type === "pattern")
      ),
      render: (num) => <SectionMascots data={data} num={num} uploadedAssets={uploadedAssets} />,
    },
    {
      id: "applications",
      title: "Aplicações",
      category: "Ativos & Entrega",
      when: true,
      render: (num) => (
        <SectionApplications
          data={data}
          num={num}
          generatedImages={generatedImages}
          onGoToImages={onGoToImages}
          onUpdateApplicationImageKey={onUpdateApplicationImageKey}
        />
      ),
    },
    {
      id: "production-guidelines",
      title: "Produção & Handoff",
      category: "Ativos & Entrega",
      when: !!data.productionGuidelines,
      render: (num) => <SectionProductionGuidelines data={data} num={num} />,
    },
    {
      id: "social-media",
      title: "Guia de Redes Sociais",
      category: "Ativos & Entrega",
      when: !!data.socialMediaGuidelines && data.socialMediaGuidelines.platforms.length > 0,
      render: (num) => <SectionSocialMedia data={data} num={num} />,
    },
  ];

  const sections = sectionDefs
    .filter((s) => s.when)
    .map((s, idx) => ({ ...s, num: idx + 1 }));

  const categories: Category[] = [
    "Estratégia",
    "Identidade Visual",
    "Design System",
    "Produto & UX",
    "Ativos & Entrega",
  ];

  const byCategory = categories
    .map((cat) => ({
      cat,
      items: sections.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto" id="brandbook-content">
      <FontLoader data={data} />
      <SectionCover data={data} />

      <section className="page-break mb-16" id="sumario">
        <div className="mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold">Sumário</h2>
          <p className="text-gray-600 mt-2">
            Navegue por categorias e vá direto à seção desejada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {byCategory.map((g) => (
            <div key={g.cat} className="bg-white border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                {g.cat}
              </h3>
              <div className="space-y-2">
                {g.items.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gray-500 mt-0.5">
                        {String(s.num).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-gray-900">{s.title}</span>
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
          <div className="page-break mb-8 mt-12">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900">{g.cat}</h2>
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
