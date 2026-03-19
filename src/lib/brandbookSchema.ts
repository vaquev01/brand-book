import { z } from "zod";
import { ASSET_CATALOG } from "@/lib/imagePrompts";

const NonEmptyString = z.string().min(1);

const ColorShadeSchema = z.object({
  shade: NonEmptyString,
  hex: NonEmptyString,
});

const ColorSchema = z.object({
  name: NonEmptyString,
  hex: NonEmptyString,
  rgb: NonEmptyString,
  cmyk: NonEmptyString,
  pantone: z.string().optional(),
  usage: z.string().optional(),
  tonalScale: z.array(ColorShadeSchema).optional(),
});

const BrandConceptSchema = z.object({
  purpose: NonEmptyString,
  mission: NonEmptyString,
  vision: NonEmptyString,
  uniqueValueProposition: z.string().optional(),
  reasonsToBelieve: z.array(NonEmptyString).optional(),
  userPsychographics: z.string().optional(),
  values: z.array(NonEmptyString).min(3),
  personality: z.array(NonEmptyString).min(3),
  toneOfVoice: NonEmptyString,
  brandArchetype: z.string().optional(),
});

const LogoSchema = z.object({
  primary: NonEmptyString,
  secondary: NonEmptyString,
  symbol: NonEmptyString,
  favicon: z.string().optional(),
  symbolConcept: z.string().optional(),
  clearSpace: NonEmptyString,
  minimumSize: NonEmptyString,
  incorrectUsages: z.array(NonEmptyString).min(3),
  // 5-Pillar Semiotic Analysis
  semioticAnalysis: z.object({
    natureOfSymbol: z.enum(["Icon", "Index", "Symbol"]),
    denotation: NonEmptyString,
    connotation: NonEmptyString,
  }).optional(),
  shapePsychology: z.string().optional(),
  negativeSpaceMetaphor: z.string().optional(),
  evolutionaryStage: z.enum(["Descriptive", "Transitional", "Iconic"]).optional(),
});

const LogoVariantsSchema = z.object({
  horizontal: z.string().optional(),
  stacked: z.string().optional(),
  mono: z.string().optional(),
  negative: z.string().optional(),
  markOnly: z.string().optional(),
  wordmarkOnly: z.string().optional(),
});

const ColorsSchema = z.object({
  primary: z.array(ColorSchema).min(2),
  secondary: z.array(ColorSchema).min(1),
  semantic: z
    .object({
      success: ColorSchema,
      error: ColorSchema,
      warning: ColorSchema,
      info: ColorSchema,
    })
    .optional(),
  dataViz: z.array(ColorSchema).optional(),
});

const TypographySchema = z.object({
  name: NonEmptyString,
  usage: NonEmptyString,
  weights: z.array(NonEmptyString).min(1),
  fallbackFont: z.string().optional(),
  textTransform: z.string().optional(),
  category: z.string().optional(),
  antiBlandingRationale: z.string().optional(),
});

const TypographySetSchema = z.object({
  marketing: TypographySchema.optional(),
  ui: TypographySchema.optional(),
  monospace: TypographySchema.optional(),
  primary: TypographySchema.optional(),
  secondary: TypographySchema.optional(),
});

const TypographyScaleItemSchema = z.object({
  name: NonEmptyString,
  fontRole: z.enum(["marketing", "ui", "monospace", "primary", "secondary"]),
  size: NonEmptyString,
  lineHeight: NonEmptyString,
  fontWeight: NonEmptyString,
  letterSpacing: z.string().optional(),
  usage: NonEmptyString,
});

const DesignTokensSchema = z.object({
  spacing: z.array(NonEmptyString).min(3),
  borderRadii: z.array(NonEmptyString).min(2),
  shadows: z.array(NonEmptyString).optional(),
  breakpoints: z.array(NonEmptyString).optional(),
  grid: z.string().optional(),
});

const UiComponentGuidelineSchema = z.object({
  name: NonEmptyString,
  usage: NonEmptyString,
  states: z.array(NonEmptyString).min(1),
  do: z.array(NonEmptyString).min(1),
  dont: z.array(NonEmptyString).min(1),
  accessibilityNotes: z.array(NonEmptyString).min(1),
});

const UiGuidelinesSchema = z.object({
  layoutGrid: NonEmptyString,
  spacingDensity: NonEmptyString,
  iconographyStyle: NonEmptyString,
  illustrationStyle: NonEmptyString,
  dataVizGuidelines: NonEmptyString,
  components: z.array(UiComponentGuidelineSchema).min(2),
});

const UxPatternsSchema = z.object({
  onboarding: NonEmptyString,
  emptyStates: NonEmptyString,
  dashboardLayout: NonEmptyString,
  modalsAndDrawers: NonEmptyString,
});

const MicrocopySchema = z.object({
  buttonRules: NonEmptyString,
  errorMessages: NonEmptyString,
  emptyStateCopy: NonEmptyString,
  writingConventions: z.string().optional(),
});

const AccessibilitySchema = z.object({
  contrastRules: NonEmptyString,
  focusStates: NonEmptyString,
  colorIndependence: NonEmptyString,
});

const MotionSchema = z.object({
  transitions: NonEmptyString,
  microinteractions: NonEmptyString,
  loadingStates: NonEmptyString,
});

const MascotSchema = z.object({
  name: NonEmptyString,
  description: NonEmptyString,
  personality: NonEmptyString,
  usageGuidelines: z.array(NonEmptyString).min(1),
});

const BrandPatternSchema = z.object({
  name: NonEmptyString,
  description: NonEmptyString,
  composition: NonEmptyString,
  usage: NonEmptyString,
  density: z.string().optional(),
  background: z.string().optional(),
});

const KeyVisualSchema = z.object({
  elements: z.array(NonEmptyString).min(3),
  photographyStyle: NonEmptyString,
  iconography: z.string().optional(),
  illustrations: z.string().optional(),
  marketingArchitecture: z.string().optional(),
  compositionPhilosophy: z.string().optional(),
  mascots: z.array(MascotSchema).optional(),
  symbols: z.array(NonEmptyString).optional(),
  patterns: z.array(NonEmptyString).optional(),
  structuredPatterns: z.array(BrandPatternSchema).optional(),
  flora: z.array(NonEmptyString).optional(),
  fauna: z.array(NonEmptyString).optional(),
  objects: z.array(NonEmptyString).optional(),
});

const ASSET_KEYS = ASSET_CATALOG.map((a) => a.key);
export const AssetKeySchema = z.enum(ASSET_KEYS as [string, ...string[]]);

export type AssetKey = z.infer<typeof AssetKeySchema>;

const ApplicationSchema = z.object({
  type: NonEmptyString,
  description: NonEmptyString,
  imagePlaceholder: NonEmptyString,
  imageKey: AssetKeySchema.optional(),
  dimensions: z.string().optional(),
  materialSpecs: z.string().optional(),
  layoutGuidelines: z.string().optional(),
  typographyHierarchy: z.string().optional(),
  artDirection: z.string().optional(),
  substrates: z.array(NonEmptyString).optional(),
});

const ApplicationSchemaV2 = ApplicationSchema.extend({
  imageKey: AssetKeySchema,
});

const VerbalMessagingPillarSchema = z.object({
  title: NonEmptyString,
  description: NonEmptyString,
  proofPoints: z.array(NonEmptyString).optional(),
  exampleCopy: z.array(NonEmptyString).optional(),
});

const TonePerChannelSchema = z.object({
  channel: NonEmptyString,
  tone: NonEmptyString,
  example: NonEmptyString,
});

const VerbalIdentitySchema = z.object({
  tagline: NonEmptyString,
  oneLiner: NonEmptyString,
  brandVoiceTraits: z.array(NonEmptyString).min(3),
  messagingPillars: z.array(VerbalMessagingPillarSchema).min(3),
  vocabulary: z.object({
    preferred: z.array(NonEmptyString).min(3),
    avoid: z.array(NonEmptyString).min(3),
  }),
  doDont: z.object({
    do: z.array(NonEmptyString).min(3),
    dont: z.array(NonEmptyString).min(3),
  }),
  sampleHeadlines: z.array(NonEmptyString).min(3),
  sampleCTAs: z.array(NonEmptyString).min(4),
  tonePerChannel: z.array(TonePerChannelSchema).optional(),
});

const BrandStorySchema = z.object({
  manifesto: NonEmptyString,
  originStory: NonEmptyString,
  brandPromise: NonEmptyString,
  brandBeliefs: z.array(NonEmptyString).optional(),
});

const SocialMediaPlatformSchema = z.object({
  platform: NonEmptyString,
  primaryFormats: NonEmptyString,
  tone: NonEmptyString,
  contentPillars: z.array(NonEmptyString).min(2),
  frequency: z.string().optional(),
  doList: z.array(NonEmptyString).min(2),
  dontList: z.array(NonEmptyString).min(2),
  examplePost: z.string().optional(),
});

const SocialMediaGuidelinesSchema = z.object({
  platforms: z.array(SocialMediaPlatformSchema).min(1),
  globalHashtagStrategy: z.string().optional(),
  brandVoiceAdaptation: z.string().optional(),
});

const PositioningSchema = z.object({
  category: NonEmptyString,
  targetMarket: NonEmptyString,
  positioningStatement: NonEmptyString,
  primaryDifferentiators: z.array(NonEmptyString).min(3),
  competitiveAlternatives: z.array(NonEmptyString).min(2),
  reasonsToBelieve: z.array(NonEmptyString).min(3),
});

const AudiencePersonaSchema = z.object({
  name: NonEmptyString,
  role: NonEmptyString,
  context: NonEmptyString,
  goals: z.array(NonEmptyString).min(3),
  painPoints: z.array(NonEmptyString).min(2),
  objections: z.array(NonEmptyString).min(2),
  channels: z.array(NonEmptyString).min(2),
  companySize: z.string().optional(),
  digitalMaturity: z.string().optional(),
});

const ProductionDeliverableSchema = z.object({
  asset: NonEmptyString,
  formats: z.array(NonEmptyString).min(1),
  specs: NonEmptyString,
});

const ProductionMethodSchema = z.object({
  method: NonEmptyString,
  substrate: NonEmptyString,
  guidelines: z.array(NonEmptyString).min(1),
  restrictions: z.array(NonEmptyString).min(1),
});

const ProductionGuidelinesSchema = z.object({
  fileNamingConvention: NonEmptyString,
  handoffChecklist: z.array(NonEmptyString).min(4),
  printSpecs: z.object({
    colorProfile: NonEmptyString,
    resolution: NonEmptyString,
    bleed: NonEmptyString,
    safeMargin: NonEmptyString,
    notes: NonEmptyString,
  }),
  digitalSpecs: z.object({
    colorSpace: NonEmptyString,
    exportScales: z.array(NonEmptyString).min(1),
    formats: z.array(NonEmptyString).min(1),
    compressionGuidelines: NonEmptyString,
    notes: NonEmptyString,
  }),
  deliverables: z.array(ProductionDeliverableSchema).min(2),
  productionMethods: z.array(ProductionMethodSchema).optional(),
});

const GovernanceSchema = z.object({
  designTools: NonEmptyString,
  documentationPlatform: NonEmptyString,
  componentLibrary: NonEmptyString,
  versioningStrategy: NonEmptyString,
  updateProcess: NonEmptyString,
  ownershipRoles: NonEmptyString,
});

const ImageGenerationBriefingSchema = z.object({
  visualStyle: NonEmptyString,
  colorMood: NonEmptyString,
  compositionNotes: NonEmptyString,
  moodKeywords: z.array(NonEmptyString).min(3),
  artisticReferences: NonEmptyString,
  avoidElements: NonEmptyString,
  logoStyleGuide: NonEmptyString,
  photographyMood: NonEmptyString,
  patternStyle: NonEmptyString,
  marketingVisualLanguage: NonEmptyString,
  negativePrompt: NonEmptyString,
  emotionalCore: z.string().optional(),
  textureLanguage: z.string().optional(),
  lightingSignature: z.string().optional(),
  cameraSignature: z.string().optional(),
  brandArchetype: z.string().optional(),
  sensoryProfile: z.string().optional(),
});

export const BrandbookSchemaLoose = z.object({
  schemaVersion: z.string().optional(),
  brandName: NonEmptyString,
  industry: NonEmptyString,
  brandConcept: BrandConceptSchema,
  brandStory: BrandStorySchema.optional(),
  positioning: PositioningSchema.optional(),
  audiencePersonas: z.array(AudiencePersonaSchema).optional(),
  verbalIdentity: VerbalIdentitySchema.optional(),
  logo: LogoSchema,
  logoVariants: LogoVariantsSchema.optional(),
  colors: ColorsSchema,
  typography: TypographySetSchema,
  typographyScale: z.array(TypographyScaleItemSchema).optional(),
  designTokens: DesignTokensSchema.optional(),
  uiGuidelines: UiGuidelinesSchema.optional(),
  uxPatterns: UxPatternsSchema.optional(),
  microcopy: MicrocopySchema.optional(),
  accessibility: AccessibilitySchema.optional(),
  motion: MotionSchema.optional(),
  socialMediaGuidelines: SocialMediaGuidelinesSchema.optional(),
  keyVisual: KeyVisualSchema,
  applications: z.array(ApplicationSchema).min(1),
  productionGuidelines: ProductionGuidelinesSchema.optional(),
  imageGenerationBriefing: ImageGenerationBriefingSchema.optional(),
  governance: GovernanceSchema.optional(),
});

export const BrandbookSchemaV2 = BrandbookSchemaLoose.extend({
  schemaVersion: z.string().default("2.0"),
  brandStory: BrandStorySchema,
  positioning: PositioningSchema,
  audiencePersonas: z.array(AudiencePersonaSchema).min(2),
  verbalIdentity: VerbalIdentitySchema,
  logoVariants: LogoVariantsSchema,
  typographyScale: z.array(TypographyScaleItemSchema).min(5),
  uiGuidelines: UiGuidelinesSchema,
  uxPatterns: UxPatternsSchema,
  microcopy: MicrocopySchema,
  accessibility: AccessibilitySchema,
  motion: MotionSchema,
  socialMediaGuidelines: SocialMediaGuidelinesSchema,
  productionGuidelines: ProductionGuidelinesSchema,
  imageGenerationBriefing: ImageGenerationBriefingSchema,
  applications: z.array(ApplicationSchemaV2).min(3),
  governance: GovernanceSchema,
});

export type BrandbookV2 = z.infer<typeof BrandbookSchemaV2>;

export function formatZodIssues(issues: z.ZodIssue[], max = 12): string {
  const head = issues.slice(0, max).map((i) => {
    const path = i.path.join(".") || "root";
    return `- ${path}: ${i.message}`;
  });
  const rest = issues.length > max ? `\n- ... e mais ${issues.length - max} erro(s)` : "";
  return head.join("\n") + rest;
}
