import { describe, expect, it } from "vitest"
import { lintBrandbook } from "./brandbookLinter"
import type { BrandbookData } from "./types"

const fullBrandbook: BrandbookData = {
  brandName: "PremiumBrand",
  industry: "Luxury",
  brandConcept: {
    purpose: "Elevate experiences",
    mission: "Craft extraordinary moments",
    vision: "The standard of excellence",
    values: ["Excellence", "Craftsmanship", "Heritage"],
    personality: ["Elegant", "Confident", "Refined"],
    toneOfVoice: "Sophisticated and assured",
  },
  logo: {
    primary: "url",
    secondary: "url",
    symbol: "Crown motif",
    clearSpace: "2x mark height",
    minimumSize: "20px digital, 8mm print",
    incorrectUsages: ["stretch", "rotate", "add shadow"],
  },
  colors: {
    primary: [
      { name: "Royal Navy", hex: "#0a1628", rgb: "10,22,40", cmyk: "75,45,0,84", usage: "Primary backgrounds and text", tonalScale: [
        { shade: "50", hex: "#f0f4f8" }, { shade: "100", hex: "#d9e2ec" },
        { shade: "200", hex: "#bcccdc" }, { shade: "300", hex: "#9fb3c8" },
        { shade: "400", hex: "#829ab1" }, { shade: "500", hex: "#627d98" },
        { shade: "600", hex: "#486581" }, { shade: "700", hex: "#334e68" },
        { shade: "800", hex: "#243b53" }, { shade: "900", hex: "#0a1628" },
      ], pantone: "539 C" },
    ],
    secondary: [
      { name: "Gold", hex: "#c5a455", rgb: "197,164,85", cmyk: "0,17,57,23", usage: "Accent and premium highlights", tonalScale: [
        { shade: "50", hex: "#faf6eb" }, { shade: "100", hex: "#f0e6c4" },
        { shade: "200", hex: "#e5d69d" }, { shade: "300", hex: "#dbc676" },
        { shade: "400", hex: "#d0b64f" }, { shade: "500", hex: "#c5a455" },
      ] },
    ],
  },
  typography: {
    marketing: { name: "Playfair Display", usage: "Headlines", weights: ["400", "700"] },
    ui: { name: "Inter", usage: "Body text", weights: ["400", "500", "600"] },
  },
  typographyScale: [
    { name: "Display", fontRole: "marketing", size: "48px", lineHeight: "1.1", fontWeight: "700", usage: "Hero headlines" },
    { name: "H1", fontRole: "marketing", size: "36px", lineHeight: "1.2", fontWeight: "700", usage: "Page titles" },
    { name: "H2", fontRole: "marketing", size: "28px", lineHeight: "1.3", fontWeight: "600", usage: "Section headings" },
    { name: "Body", fontRole: "ui", size: "16px", lineHeight: "1.6", fontWeight: "400", usage: "Body text" },
    { name: "Caption", fontRole: "ui", size: "12px", lineHeight: "1.4", fontWeight: "500", usage: "Labels and captions" },
  ],
  keyVisual: {
    elements: ["Crown", "Serif details", "Gold accents"],
    photographyStyle: "Editorial luxury",
  },
  applications: [
    { type: "Business Card", description: "Premium", imagePlaceholder: "url", imageKey: "business_card", dimensions: "90x50mm", materialSpecs: "400gsm cotton", layoutGuidelines: "Center logo", typographyHierarchy: "Name > Title > Contact", artDirection: "Minimalist luxury", substrates: ["Cotton", "Linen"] },
    { type: "Letterhead", description: "Corporate", imagePlaceholder: "url", imageKey: "brand_collateral", dimensions: "A4", materialSpecs: "120gsm bond", layoutGuidelines: "Logo top-left", typographyHierarchy: "Logo > Address > Content", artDirection: "Clean", substrates: ["Bond paper"] },
    { type: "Envelope", description: "DL format", imagePlaceholder: "url", imageKey: "brand_collateral", dimensions: "DL 220x110mm", materialSpecs: "120gsm", layoutGuidelines: "Logo centered", typographyHierarchy: "Logo > Return address", artDirection: "Understated", substrates: ["Bond paper"] },
  ],
  productionGuidelines: {
    fileNamingConvention: "brand_asset-type_variant_size.ext",
    handoffChecklist: ["Converter fontes em curvas", "Expandir traços", "Check CMYK", "Verify bleeds"],
    printSpecs: { colorProfile: "ISO Coated v2", resolution: "300dpi", bleed: "3mm", safeMargin: "5mm", notes: "Use spot colors for gold" },
    digitalSpecs: { colorSpace: "sRGB", exportScales: ["1x", "2x", "3x"], formats: ["SVG", "PNG", "WebP"], compressionGuidelines: "WebP q80", notes: "Always include SVG for scalable assets" },
    deliverables: [
      { asset: "Logo Pack", formats: ["SVG", "PNG", "EPS", "PDF"], specs: "All color variants" },
      { asset: "Brand Guide PDF", formats: ["PDF"], specs: "Press-ready, spreads" },
    ],
  },
  imageGenerationBriefing: {
    visualStyle: "Editorial luxury photography",
    colorMood: "Deep navy with warm gold accents",
    compositionNotes: "Center-weighted, generous negative space",
    moodKeywords: ["Opulent", "Refined", "Timeless", "Warm"],
    artisticReferences: "Bottega Veneta campaigns, Aesop stores",
    avoidElements: "Neon, plastic, cheap materials, clutter",
    logoStyleGuide: "Minimal serif wordmark with crown accent",
    photographyMood: "Warm studio with directional light",
    patternStyle: "Geometric lattice with gold nodes",
    marketingVisualLanguage: "Less is more, materials speak",
    negativePrompt: "cheap, plastic, neon, cluttered, amateur",
    emotionalCore: "The quiet confidence of true quality",
    textureLanguage: "Brushed metal, matte paper, woven textiles",
    lightingSignature: "Warm 3200K with cool shadow contrast",
  },
  governance: {
    designTools: "Figma",
    documentationPlatform: "Notion",
    componentLibrary: "Storybook",
    versioningStrategy: "Semantic versioning",
    updateProcess: "Quarterly review",
    ownershipRoles: "Brand team lead",
  },
  verbalIdentity: {
    tagline: "The Art of Excellence",
    oneLiner: "Crafting extraordinary brand experiences",
    brandVoiceTraits: ["Confident", "Refined", "Warm"],
    messagingPillars: [
      { title: "Heritage", description: "Rooted in tradition" },
      { title: "Craft", description: "Meticulous attention to detail" },
      { title: "Vision", description: "Forward-thinking innovation" },
    ],
    vocabulary: { preferred: ["curated", "bespoke", "artisanal"], avoid: ["cheap", "basic", "budget"] },
    doDont: { do: ["Speak with authority", "Use precise language", "Reference craftsmanship"], dont: ["Use slang", "Be casual", "Overclaim"] },
    sampleHeadlines: ["Excellence, Defined.", "Where Craft Meets Vision", "The Standard, Reimagined"],
    sampleCTAs: ["Discover More", "Experience Excellence", "Begin Your Journey", "Explore the Collection"],
  },
}

describe("brandbookLinter — comprehensive", () => {
  it("gives a high score to a complete premium brandbook", () => {
    const report = lintBrandbook(fullBrandbook)
    expect(report.ok).toBe(true)
    expect(report.score).toBeGreaterThanOrEqual(80)
  })

  it("detects missing production guidelines", () => {
    const { productionGuidelines, ...rest } = fullBrandbook
    const report = lintBrandbook(rest as BrandbookData)
    expect(report.issues.some(i => i.area === "productionGuidelines")).toBe(true)
    expect(report.stats.critical).toBeGreaterThan(0)
  })

  it("detects orphaned typography scale roles", () => {
    const broken = {
      ...fullBrandbook,
      typographyScale: [
        { name: "Display", fontRole: "monospace" as const, size: "48px", lineHeight: "1.1", fontWeight: "700", usage: "Headlines" },
      ],
    }
    const report = lintBrandbook(broken)
    expect(report.issues.some(i => i.area === "typographyScale" && i.severity === "critical")).toBe(true)
  })

  it("detects duplicate color names", () => {
    const broken = {
      ...fullBrandbook,
      colors: {
        primary: [
          { name: "Blue", hex: "#000", rgb: "0,0,0", cmyk: "0,0,0,100" },
        ],
        secondary: [
          { name: "Blue", hex: "#111", rgb: "1,1,1", cmyk: "0,0,0,99" },
        ],
      },
    }
    const report = lintBrandbook(broken)
    expect(report.issues.some(i => i.area === "colors" && i.issue.includes("duplicados"))).toBe(true)
  })

  it("suggests governance when missing", () => {
    const { governance, ...rest } = fullBrandbook
    const report = lintBrandbook(rest as BrandbookData)
    expect(report.issues.some(i => i.area === "governance")).toBe(true)
  })
})
