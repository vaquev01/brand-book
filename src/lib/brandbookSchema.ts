import { z } from "zod";

const NonEmptyString = z.string().min(1);

const ColorSchema = z.object({
  name: NonEmptyString,
  hex: NonEmptyString,
  rgb: NonEmptyString,
  cmyk: NonEmptyString,
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
});

const LogoSchema = z.object({
  primary: NonEmptyString,
  secondary: NonEmptyString,
  symbol: NonEmptyString,
  favicon: z.string().optional(),
  clearSpace: NonEmptyString,
  minimumSize: NonEmptyString,
  incorrectUsages: z.array(NonEmptyString).min(3),
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

const KeyVisualSchema = z.object({
  elements: z.array(NonEmptyString).min(3),
  photographyStyle: NonEmptyString,
  iconography: z.string().optional(),
  illustrations: z.string().optional(),
  marketingArchitecture: z.string().optional(),
});

export const AssetKeySchema = z.enum([
  "logo_primary",
  "logo_dark_bg",
  "brand_pattern",
  "hero_visual",
  "hero_lifestyle",
  "business_card",
  "social_cover",
  "social_post_square",
  "app_mockup",
  "brand_collateral",
  "email_header",
  "outdoor_billboard",
]);

export type AssetKey = z.infer<typeof AssetKeySchema>;

const ApplicationSchema = z.object({
  type: NonEmptyString,
  description: NonEmptyString,
  imagePlaceholder: NonEmptyString,
  imageKey: AssetKeySchema.optional(),
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
});

const ProductionDeliverableSchema = z.object({
  asset: NonEmptyString,
  formats: z.array(NonEmptyString).min(1),
  specs: NonEmptyString,
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
});

export const BrandbookSchemaLoose = z.object({
  schemaVersion: z.string().optional(),
  brandName: NonEmptyString,
  industry: NonEmptyString,
  brandConcept: BrandConceptSchema,
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
  keyVisual: KeyVisualSchema,
  applications: z.array(ApplicationSchema).min(1),
  productionGuidelines: ProductionGuidelinesSchema.optional(),
  imageGenerationBriefing: ImageGenerationBriefingSchema.optional(),
});

export const BrandbookSchemaV2 = BrandbookSchemaLoose.extend({
  schemaVersion: z.string().default("2.0"),
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
  productionGuidelines: ProductionGuidelinesSchema,
  imageGenerationBriefing: ImageGenerationBriefingSchema,
  applications: z.array(ApplicationSchemaV2).min(3),
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
