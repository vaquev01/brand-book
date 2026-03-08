import type { Application, BrandbookData } from "./types";
import { buildBrandNameFidelityLines } from "./brandNameFidelity";

export type ImageGenerationIntentMode =
  | "logo"
  | "pattern"
  | "mascot"
  | "application"
  | "social"
  | "custom"
  | "scene";

export interface ImageGenerationIntentInput {
  brandbook: BrandbookData;
  assetKey?: string;
  application?: Pick<
    Application,
    | "type"
    | "description"
    | "dimensions"
    | "materialSpecs"
    | "layoutGuidelines"
    | "typographyHierarchy"
    | "artDirection"
    | "substrates"
  >;
  brief?: string;
  aspectRatio?: string;
  creativity?: "consistent" | "balanced" | "creative";
  referenceImageMode?: "strict" | "guided" | "loose" | "remix" | "none";
}

export interface ImageGenerationIntentModel {
  mode: ImageGenerationIntentMode;
  strategic: {
    targetOutcome: string;
    jobs: string[];
    pains: string[];
    gains: string[];
    recognitionAnchors: string[];
    nonNegotiables: string[];
  };
  semiotic: {
    iconicCues: string[];
    indexicalCues: string[];
    symbolicCues: string[];
    gestaltRules: string[];
    shapePsychology: string;
    negativeSpaceOpportunity: string;
    boubaKikiBias: string;
  };
  blueprint: {
    centralThesis: string;
    heroDecision: string;
    dominantHierarchy: string;
    components: string[];
    productionConstraints: string[];
  };
  distinctiveness: {
    antiBlanding: string;
    noveltyTension: string;
    motionReadiness: string;
    reductionStress: string;
  };
  validation: {
    scoreAxes: string[];
    repairLoop: string;
    visualUsabilityHeuristics: string[];
    failConditions: string[];
  };
}

function compact(values: Array<string | undefined | null | false>, limit = 999): string[] {
  return values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim())
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, limit);
}

function inferMode(assetKey?: string, applicationType?: string): ImageGenerationIntentMode {
  const key = (assetKey ?? "").toLowerCase();
  const appType = (applicationType ?? "").toLowerCase();

  if (key === "logo_primary" || key === "logo_dark_bg") return "logo";
  if (key === "brand_pattern" || key === "presentation_bg") return "pattern";
  if (key === "brand_mascot") return "mascot";
  if (["instagram_carousel", "instagram_story", "social_cover", "social_post_square", "youtube_thumbnail"].includes(key)) {
    return "social";
  }
  if (key || appType) {
    if (/logo|wordmark|identidade/.test(appType)) return "logo";
    if (/pattern|padrão|textura/.test(appType)) return "pattern";
    if (/mascot|mascote|character|personagem/.test(appType)) return "mascot";
    if (/social|instagram|story|feed|carousel|youtube|linkedin/.test(appType)) return "social";
    return "application";
  }
  return "custom";
}

function inferBoubaKikiBias(brandbook: BrandbookData, mode: ImageGenerationIntentMode): string {
  const source = [
    brandbook.brandConcept.toneOfVoice,
    ...brandbook.brandConcept.personality,
    brandbook.imageGenerationBriefing?.logoStyleGuide ?? "",
    brandbook.imageGenerationBriefing?.visualStyle ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const soft = /(warm|acolhed|human|organic|coloquial|gentle|friendly|soft|boteco|tropical)/.test(source);
  const sharp = /(precise|bold|sharp|cut|angular|rigor|tech|performance|assertive|structured)/.test(source);

  if (mode === "logo") {
    if (soft && sharp) return "hybrid rounded-meets-precise tension; warmth first, structure second";
    if (soft) return "bouba-leaning rounded contours and welcoming counterspaces";
    if (sharp) return "kiki-leaning crisp geometry with controlled angular emphasis";
  }

  if (soft && sharp) return "balanced curve-to-angle contrast with one dominant emotional cue";
  if (soft) return "rounded, tactile, inviting formal language";
  if (sharp) return "precise, directional, assertive formal language";
  return "balanced form language with no arbitrary extremity";
}

function inferGestaltRules(mode: ImageGenerationIntentMode): string[] {
  if (mode === "logo") {
    return [
      "closure for memorability without harming legibility",
      "figure-ground separation with intelligent negative space",
      "continuity between symbol and wordmark",
      "small-size silhouette clarity before detail",
    ];
  }
  if (mode === "pattern") {
    return [
      "repetition and rhythm as native brand grammar",
      "figure-ground balance so the system breathes",
      "edge-to-center continuity without decorative overload",
      "proximity and interval discipline",
    ];
  }
  if (mode === "social") {
    return [
      "one dominant figure at first glance",
      "clear reading order for mobile cognition",
      "controlled figure-ground contrast for thumb-stop impact",
      "negative space reserved for future copy needs",
    ];
  }
  return [
    "clear focal hierarchy",
    "figure-ground clarity",
    "proximity and grouping that reduce cognitive load",
    "removal of decorative competition around the main message",
  ];
}

function inferBlueprintComponents(mode: ImageGenerationIntentMode): string[] {
  if (mode === "logo") {
    return [
      "symbol thesis",
      "wordmark thesis",
      "relationship between mark and text",
      "figure-ground move",
      "palette memory",
      "reduction and favicon resilience",
    ];
  }
  if (mode === "pattern") {
    return [
      "root motif",
      "repeat logic",
      "density control",
      "edge and center behavior",
      "tileability",
      "support role across applications",
    ];
  }
  if (mode === "mascot") {
    return [
      "character silhouette",
      "expression and personality cue",
      "shape language coherence",
      "line-weight consistency",
      "animation readiness",
    ];
  }
  return [
    "subject or hero move",
    "dominant hierarchy",
    "logo and brand-asset integration",
    "materiality",
    "composition and crop",
    "production realism",
  ];
}

function inferScoreAxes(mode: ImageGenerationIntentMode): string[] {
  if (mode === "logo") {
    return [
      "recognition and memorability",
      "essence-to-form translation",
      "symbol-wordmark coherence",
      "small-size resilience",
      "distinctiveness without gimmick",
    ];
  }
  if (mode === "pattern") {
    return [
      "native system grammar",
      "repeat quality",
      "recognition anchors",
      "center readability when needed",
      "distinctiveness versus filler",
    ];
  }
  return [
    "recognition at first glance",
    "emotional fidelity",
    "system coherence",
    "real-world plausibility",
    "distinctiveness versus template aesthetics",
  ];
}

function inferTargetOutcome(input: ImageGenerationIntentInput, mode: ImageGenerationIntentMode): string {
  const { brandbook, brief, application, aspectRatio } = input;
  if (mode === "logo") {
    return `Create an ownable mark for ${brandbook.brandName} that preserves brand memory and scales from favicon to flagship application.`;
  }
  if (mode === "pattern") {
    return `Create a native brand pattern system for ${brandbook.brandName} that can repeat across packaging, surfaces, and backgrounds without turning decorative noise.`;
  }
  if (mode === "mascot") {
    return `Create a character asset for ${brandbook.brandName} that feels born from the same visual system, not imported from a different style universe.`;
  }
  if (application) {
    return `Create a real-world ${application.type} for ${brandbook.brandName}${aspectRatio ? ` in ${aspectRatio}` : ""} that feels operational, premium, and unmistakably on-brand.`;
  }
  if (brief) {
    return `Translate the user intent into a ${aspectRatio ? `${aspectRatio} ` : ""}visual outcome for ${brandbook.brandName} that keeps proprietary brand memory stronger than generic polish.`;
  }
  return `Create a coherent brand-world image for ${brandbook.brandName} with immediate recognition and production-ready intent.`;
}

export function buildImageGenerationIntentModel(input: ImageGenerationIntentInput): ImageGenerationIntentModel {
  const { brandbook, brief, application, aspectRatio, creativity, referenceImageMode } = input;
  const mode = inferMode(input.assetKey, application?.type);
  const persona = brandbook.audiencePersonas?.[0];
  const primaryColors = (brandbook.colors.primary ?? []).slice(0, 2).map((color) => `${color.name} ${color.hex}`);
  const flora = (brandbook.keyVisual.flora ?? []).slice(0, 3);
  const fauna = (brandbook.keyVisual.fauna ?? []).slice(0, 3);
  const objects = (brandbook.keyVisual.objects ?? []).slice(0, 3);
  const symbols = (brandbook.keyVisual.symbols ?? []).slice(0, 4);
  const patterns = (brandbook.keyVisual.patterns ?? []).slice(0, 4);
  const elements = (brandbook.keyVisual.elements ?? []).slice(0, 6);
  const structuredPatterns = (brandbook.keyVisual.structuredPatterns ?? [])
    .slice(0, 2)
    .map((pattern) => `${pattern.name}: ${pattern.composition}${pattern.density ? ` (${pattern.density})` : ""}`);
  const fidelityLines = buildBrandNameFidelityLines(brandbook.brandName, brandbook.logo.incorrectUsages ?? [], mode === "logo" ? "logo" : "brand_visible");
  const iconicCues = mode === "logo"
    ? compact([brandbook.logo.symbol, ...symbols, ...patterns])
    : compact([...elements, ...flora, ...fauna, ...objects, brandbook.logo.symbol]);
  const indexicalCues = compact([
    brandbook.imageGenerationBriefing?.photographyMood,
    brandbook.imageGenerationBriefing?.textureLanguage,
    brandbook.imageGenerationBriefing?.lightingSignature,
    brandbook.keyVisual.compositionPhilosophy,
    application?.materialSpecs,
    application?.layoutGuidelines,
    application?.artDirection,
  ]);
  const symbolicCues = compact([
    brandbook.brandConcept.purpose,
    brandbook.brandStory?.brandPromise,
    brandbook.brandConcept.brandArchetype,
    brandbook.brandConcept.toneOfVoice,
    ...(brandbook.brandConcept.values ?? []).slice(0, 4),
    brandbook.imageGenerationBriefing?.artisticReferences,
  ]);
  const nonNegotiables = compact([
    `canonical brand name must remain exactly ${brandbook.brandName}`,
    primaryColors.length > 0 ? `recognition palette anchored in ${primaryColors.join(" + ")}` : "",
    brandbook.logo.symbol ? `core symbol logic: ${brandbook.logo.symbol}` : "",
    brandbook.keyVisual.compositionPhilosophy ? `signature composition: ${brandbook.keyVisual.compositionPhilosophy}` : "",
    brandbook.imageGenerationBriefing?.avoidElements ? `avoid: ${brandbook.imageGenerationBriefing.avoidElements}` : "",
    ...fidelityLines,
  ]);
  const jobs = compact([
    ...(persona?.goals ?? []).slice(0, 4),
    brandbook.positioning?.targetMarket,
    application?.description,
    brief,
  ]);
  const pains = compact([
    ...(persona?.painPoints ?? []).slice(0, 4),
    ...(persona?.objections ?? []).slice(0, 2),
    brandbook.imageGenerationBriefing?.avoidElements,
    mode === "logo" ? "generic, cold, corporate drift" : "template aesthetics and decorative clutter",
  ]);
  const gains = compact([
    brandbook.brandConcept.uniqueValueProposition,
    ...(brandbook.positioning?.reasonsToBelieve ?? []).slice(0, 4),
    ...(brandbook.brandConcept.reasonsToBelieve ?? []).slice(0, 4),
    brandbook.brandStory?.brandPromise,
    mode === "logo" ? "memorable reduction and ownability" : "recognition at first glance and lived-brand plausibility",
  ]);
  const targetOutcome = inferTargetOutcome(input, mode);
  const centralThesis = compact([
    brief,
    brandbook.brandConcept.purpose,
    brandbook.brandStory?.brandPromise,
    brandbook.verbalIdentity?.tagline,
  ])[0] ?? targetOutcome;
  const heroDecision = mode === "logo"
    ? "choose one symbolic thesis and let every proportion, counterspace, and text relation serve that thesis"
    : mode === "pattern"
      ? "choose one repeat logic and one density strategy before styling"
      : mode === "mascot"
        ? "choose one personality-defining silhouette and keep every detail subordinate to it"
        : "choose one focal move and prevent every secondary element from competing with it";
  const dominantHierarchy = mode === "logo"
    ? "wordmark exactness -> mark ownability -> figure-ground clarity -> palette memory"
    : mode === "pattern"
      ? "root motif -> interval rhythm -> edge/center behavior -> support role"
      : mode === "social"
        ? "hero visual cue -> mobile readability -> logo support -> atmospheric accents"
        : "hero subject -> brand recognition anchor -> support motifs -> environmental realism";
  const productionConstraints = compact([
    aspectRatio ? `aspect ratio: ${aspectRatio}` : "",
    application?.dimensions ? `dimensions: ${application.dimensions}` : "",
    application?.typographyHierarchy ? `typography hierarchy: ${application.typographyHierarchy}` : "",
    application?.substrates?.length ? `substrates: ${application.substrates.join(", ")}` : "",
    creativity ? `creativity mode: ${creativity}` : "",
    referenceImageMode && referenceImageMode !== "none" ? `reference-image mode: ${referenceImageMode}` : "",
  ]);
  const antiBlanding = mode === "logo"
    ? "avoid startup-neutral, over-sanitized vector marks; preserve any human, colloquial, or culturally ownable charge in the form language"
    : "avoid template moodboards, generic premium styling, and borrowed aesthetics that could belong to any brand";
  const noveltyTension = mode === "logo"
    ? "introduce distinctiveness through one earned asymmetry, ligature, punctuation cue, counterspace move, or structural tension only if it strengthens recognition"
    : "allow one controlled surprise in hierarchy, crop, rhythm, or materiality only when it deepens brand memory";
  const motionReadiness = mode === "logo"
    ? "the mark should imply kinetic logic and remain coherent in simple reveal, loop, or micro-motion scenarios"
    : "the composition should suggest how the system breathes in motion, transitions, loops, or scroll-based digital use";
  const reductionStress = mode === "logo"
    ? "test mentally at favicon and small interface sizes; remove any detail that does not survive reduction"
    : "test mentally at thumbnail, mobile, and distant-view scales; preserve first-glance recognition";
  const repairLoop = mode === "logo"
    ? "score, critique, and rewrite until recognition, small-size legibility, and brand-specific emotional charge are all clearly above threshold"
    : "score, critique, and rewrite until the output reads as one coherent brand world with no generic filler or unjustified elements";
  const failConditions = compact([
    mode === "logo"
      ? `if it feels colder, more generic, or less ownable than ${brandbook.brandName}, it fails`
      : `if it feels like a template, moodboard, or stock aesthetic for ${brandbook.brandName}, it fails`,
    "if brand recognition weakens, it fails",
    "if any element has no clear job, it fails",
    referenceImageMode === "strict" ? "if the composition drifts too far from the supplied layout, it fails" : "",
  ]);

  return {
    mode,
    strategic: {
      targetOutcome,
      jobs,
      pains,
      gains,
      recognitionAnchors: compact([...primaryColors, brandbook.logo.symbol, ...flora, ...fauna, ...objects, ...structuredPatterns]),
      nonNegotiables,
    },
    semiotic: {
      iconicCues,
      indexicalCues,
      symbolicCues,
      gestaltRules: inferGestaltRules(mode),
      shapePsychology: ((brandbook.logo as unknown as Record<string, unknown>).shapePsychology as string | undefined) ?? `${brandbook.brandConcept.brandArchetype ?? "Creator"} translated into a form language that stays memorable under reduction`,
      negativeSpaceOpportunity: ((brandbook.logo as unknown as Record<string, unknown>).negativeSpaceMetaphor as string | undefined) ?? "use negative space only when it strengthens recognition and cognitive elegance",
      boubaKikiBias: inferBoubaKikiBias(brandbook, mode),
    },
    blueprint: {
      centralThesis,
      heroDecision,
      dominantHierarchy,
      components: inferBlueprintComponents(mode),
      productionConstraints,
    },
    distinctiveness: {
      antiBlanding,
      noveltyTension,
      motionReadiness,
      reductionStress,
    },
    validation: {
      scoreAxes: inferScoreAxes(mode),
      repairLoop,
      visualUsabilityHeuristics: compact([
        "clarity of primary action or reading order",
        "contrast and legibility under scale reduction",
        "consistency between promise, form, and use context",
        "cognitive economy: no excess decorative load",
      ]),
      failConditions,
    },
  };
}

export function buildImageGenerationIntentSummary(input: ImageGenerationIntentInput): string {
  const model = buildImageGenerationIntentModel(input);
  const lines = [
    `PHASE_A_STRATEGIC_INTENT: ${model.strategic.targetOutcome}`,
    model.strategic.jobs.length > 0 ? `JOBS_TO_BE_DONE: ${model.strategic.jobs.join(" | ")}.` : "",
    model.strategic.pains.length > 0 ? `PAINS_TO_RESOLVE: ${model.strategic.pains.join(" | ")}.` : "",
    model.strategic.gains.length > 0 ? `GAINS_TO_DELIVER: ${model.strategic.gains.join(" | ")}.` : "",
    model.strategic.recognitionAnchors.length > 0 ? `RECOGNITION_ANCHORS_EXTENDED: ${model.strategic.recognitionAnchors.join(" | ")}.` : "",
    model.strategic.nonNegotiables.length > 0 ? `NON_NEGOTIABLES: ${model.strategic.nonNegotiables.join(" | ")}.` : "",
    `PHASE_B_SEMIOTIC_TRANSLATION: translate strategy into perceivable brand memory, not generic style.` ,
    model.semiotic.iconicCues.length > 0 ? `ICONIC_CUES: ${model.semiotic.iconicCues.join(" | ")}.` : "",
    model.semiotic.indexicalCues.length > 0 ? `INDEXICAL_CUES: ${model.semiotic.indexicalCues.join(" | ")}.` : "",
    model.semiotic.symbolicCues.length > 0 ? `SYMBOLIC_CUES: ${model.semiotic.symbolicCues.join(" | ")}.` : "",
    `GESTALT_RULES: ${model.semiotic.gestaltRules.join(" | ")}.`,
    `SHAPE_PSYCHOLOGY_ADVANCED: ${model.semiotic.shapePsychology}.`,
    `NEGATIVE_SPACE_OPPORTUNITY: ${model.semiotic.negativeSpaceOpportunity}.`,
    `BOUBA_KIKI_BIAS: ${model.semiotic.boubaKikiBias}.`,
    `PHASE_C_BLUEPRINT: construct the solution from intentional components before styling.`,
    `CENTRAL_THESIS: ${model.blueprint.centralThesis}.`,
    `HERO_DECISION_EXTENDED: ${model.blueprint.heroDecision}.`,
    `DOMINANT_HIERARCHY_EXTENDED: ${model.blueprint.dominantHierarchy}.`,
    `BLUEPRINT_COMPONENTS: ${model.blueprint.components.join(" | ")}.`,
    model.blueprint.productionConstraints.length > 0 ? `PRODUCTION_CONSTRAINTS: ${model.blueprint.productionConstraints.join(" | ")}.` : "",
    `PHASE_D_DISTINCTIVENESS_GOVERNANCE: force memorable specificity without breaking coherence.`,
    `ANTI_BLANDING_PROTOCOL: ${model.distinctiveness.antiBlanding}.`,
    `NOVELTY_TENSION: ${model.distinctiveness.noveltyTension}.`,
    `MOTION_READINESS: ${model.distinctiveness.motionReadiness}.`,
    `REDUCTION_STRESS_TEST: ${model.distinctiveness.reductionStress}.`,
    `PHASE_E_RECURSIVE_VALIDATION: critique and repair before finalizing.`,
    `VALIDATION_AXES: ${model.validation.scoreAxes.join(" | ")}.`,
    `REPAIR_LOOP: ${model.validation.repairLoop}.`,
    `VISUAL_USABILITY_HEURISTICS: ${model.validation.visualUsabilityHeuristics.join(" | ")}.`,
    `FAIL_CONDITIONS_EXTENDED: ${model.validation.failConditions.join(" | ")}.`,
  ];

  return lines.filter(Boolean).join(" ");
}

export function buildImageGenerationFrameworkPrimer(): string {
  return [
    "Operate through a 5-phase generative-intention system.",
    "Phase A: strategic intent and business outcome.",
    "Phase B: semiotic translation using icon, index, symbol, gestalt, negative space, and shape psychology.",
    "Phase C: blueprint decomposition before styling.",
    "Phase D: distinctiveness and motion-first governance to avoid blanding.",
    "Phase E: recursive critique and repair before final output.",
  ].join(" ");
}
