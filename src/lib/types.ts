export interface Color {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
}

export interface Typography {
  name: string;
  usage: string;
  weights: string[];
}

export interface BrandConcept {
  purpose: string;
  mission: string;
  vision: string;
  uniqueValueProposition?: string;
  reasonsToBelieve?: string[];
  userPsychographics?: string;
  values: string[];
  personality: string[];
  toneOfVoice: string;
}

export interface Logo {
  primary: string;
  secondary: string;
  symbol: string;
  favicon?: string;
  clearSpace: string;
  minimumSize: string;
  incorrectUsages: string[];
}

export interface Colors {
  primary: Color[];
  secondary: Color[];
  semantic?: {
    success: Color;
    error: Color;
    warning: Color;
    info: Color;
  };
  dataViz?: Color[];
}

export interface TypographySet {
  marketing?: Typography;
  ui?: Typography;
  monospace?: Typography;
  primary?: Typography;
  secondary?: Typography;
}

export interface DesignTokens {
  spacing: string[];
  borderRadii: string[];
}

export interface UxPatterns {
  onboarding: string;
  emptyStates: string;
  dashboardLayout: string;
  modalsAndDrawers: string;
}

export interface Microcopy {
  buttonRules: string;
  errorMessages: string;
  emptyStateCopy: string;
}

export interface Accessibility {
  contrastRules: string;
  focusStates: string;
  colorIndependence: string;
}

export interface Motion {
  transitions: string;
  microinteractions: string;
  loadingStates: string;
}

export interface KeyVisual {
  elements: string[];
  photographyStyle: string;
  iconography?: string;
  illustrations?: string;
  marketingArchitecture?: string;
}

export interface Application {
  type: string;
  description: string;
  imagePlaceholder: string;
  imageKey?: string;
}

export interface VerbalMessagingPillar {
  title: string;
  description: string;
  proofPoints?: string[];
  exampleCopy?: string[];
}

export interface VerbalIdentity {
  tagline: string;
  oneLiner: string;
  brandVoiceTraits: string[];
  messagingPillars: VerbalMessagingPillar[];
  vocabulary: {
    preferred: string[];
    avoid: string[];
  };
  doDont: {
    do: string[];
    dont: string[];
  };
  sampleHeadlines: string[];
  sampleCTAs: string[];
}

export interface Positioning {
  category: string;
  targetMarket: string;
  positioningStatement: string;
  primaryDifferentiators: string[];
  competitiveAlternatives: string[];
  reasonsToBelieve: string[];
}

export interface AudiencePersona {
  name: string;
  role: string;
  context: string;
  goals: string[];
  painPoints: string[];
  objections: string[];
  channels: string[];
}

export interface LogoVariants {
  horizontal?: string;
  stacked?: string;
  mono?: string;
  negative?: string;
  markOnly?: string;
  wordmarkOnly?: string;
}

export interface TypographyScaleItem {
  name: string;
  fontRole: "marketing" | "ui" | "monospace" | "primary" | "secondary";
  size: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
  usage: string;
}

export interface UiComponentGuideline {
  name: string;
  usage: string;
  states: string[];
  do: string[];
  dont: string[];
  accessibilityNotes: string[];
}

export interface UiGuidelines {
  layoutGrid: string;
  spacingDensity: string;
  iconographyStyle: string;
  illustrationStyle: string;
  dataVizGuidelines: string;
  components: UiComponentGuideline[];
}

export interface ProductionDeliverable {
  asset: string;
  formats: string[];
  specs: string;
}

export interface ProductionGuidelines {
  fileNamingConvention: string;
  handoffChecklist: string[];
  printSpecs: {
    colorProfile: string;
    resolution: string;
    bleed: string;
    safeMargin: string;
    notes: string;
  };
  digitalSpecs: {
    colorSpace: string;
    exportScales: string[];
    formats: string[];
    compressionGuidelines: string;
    notes: string;
  };
  deliverables: ProductionDeliverable[];
}

export interface ImageGenerationBriefing {
  visualStyle: string;
  colorMood: string;
  compositionNotes: string;
  moodKeywords: string[];
  artisticReferences: string;
  avoidElements: string;
  logoStyleGuide: string;
  photographyMood: string;
  patternStyle: string;
  marketingVisualLanguage: string;
  negativePrompt: string;
}

export interface BrandbookData {
  schemaVersion?: string;
  brandName: string;
  industry: string;
  brandConcept: BrandConcept;
  verbalIdentity?: VerbalIdentity;
  positioning?: Positioning;
  audiencePersonas?: AudiencePersona[];
  logo: Logo;
  logoVariants?: LogoVariants;
  colors: Colors;
  typography: TypographySet;
  typographyScale?: TypographyScaleItem[];
  designTokens?: DesignTokens;
  uiGuidelines?: UiGuidelines;
  uxPatterns?: UxPatterns;
  microcopy?: Microcopy;
  accessibility?: Accessibility;
  motion?: Motion;
  keyVisual: KeyVisual;
  applications: Application[];
  productionGuidelines?: ProductionGuidelines;
  imageGenerationBriefing?: ImageGenerationBriefing;
}

export type ImageProvider = "dalle3" | "stability" | "ideogram" | "imagen";

export interface GeneratedAsset {
  key: string;
  url: string;
  provider: ImageProvider;
  prompt: string;
  generatedAt: string;
}

export interface ProductionColorSpec {
  role: string;
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  hsl: string;
  cssVar: string;
  scssVar: string;
}

export interface ProductionAsset {
  name: string;
  type: "print" | "digital" | "social" | "email";
  dimensions: string;
  format: string;
  colorProfile: string;
  resolution?: string;
  bleed?: string;
  notes: string;
}

export interface ProductionManifest {
  meta: {
    brandName: string;
    industry: string;
    generatedAt: string;
    version: string;
  };
  brandIdentity: BrandbookData;
  colorSystem: {
    colors: ProductionColorSpec[];
    cssVariables: string;
    scssVariables: string;
  };
  typographySystem: {
    googleFontsUrl: string;
    cssVariables: string;
    scssVariables: string;
  };
  designTokens: {
    css: string;
    scss: string;
    tailwindExtend: Record<string, unknown>;
    json: Record<string, unknown>;
  };
  logoProductionSpecs: {
    requiredFormats: string[];
    colorVersions: string[];
    minimumSize: string;
    clearSpace: string;
    incorrectUsages: string[];
  };
  assets: {
    print: ProductionAsset[];
    digital: ProductionAsset[];
    social: ProductionAsset[];
    email: ProductionAsset[];
  };
}

export interface GenerateRequest {
  brandName: string;
  industry: string;
  briefing: string;
}
