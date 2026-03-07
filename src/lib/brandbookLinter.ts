import type { BrandbookData, Color, TypographySet, TypographyScaleItem } from "@/lib/types";

export type BrandbookLintSeverity = "critical" | "warning" | "suggestion";

export type BrandbookLintIssue = {
  severity: BrandbookLintSeverity;
  area: string;
  issue: string;
  fix: string;
  fieldPaths?: string[];
};

export type BrandbookLintStats = {
  critical: number;
  warning: number;
  suggestion: number;
};

export type BrandbookLintReport = {
  ok: boolean;
  score: number;
  summary: string;
  issues: BrandbookLintIssue[];
  stats: BrandbookLintStats;
};

const REQUIRED_PRODUCTION_CHECKLIST_HINTS = [
  "converter fontes em curvas",
  "create outlines",
  "expandir traços",
  "outline stroke",
];

const TYPOGRAPHY_SCALE_CORE_NAMES = ["display", "h1", "body", "caption"];
const TYPOGRAPHY_SCALE_RECOMMENDED_NAMES = ["display", "h1", "h2", "h3", "body", "caption", "overline"];
const REQUIRED_APPLICATION_FIELDS = [
  "dimensions",
  "materialSpecs",
  "layoutGuidelines",
  "typographyHierarchy",
  "artDirection",
  "substrates",
] as const;
const REQUIRED_IMAGE_BRIEF_FIELDS = [
  "emotionalCore",
  "textureLanguage",
  "lightingSignature",
  "cameraSignature",
  "sensoryProfile",
] as const;
const COLOR_REFERENCE_SECTIONS = [
  "typography",
  "keyVisual",
  "applications",
  "productionGuidelines",
  "imageGenerationBriefing",
  "uiGuidelines",
] as const;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (value && typeof value === "object") return Object.values(value).flatMap((item) => collectStrings(item));
  return [];
}

function colorUsageLabel(role: string, index: number) {
  return `${role}[${index}]`;
}

function buildStats(issues: BrandbookLintIssue[]): BrandbookLintStats {
  return issues.reduce<BrandbookLintStats>(
    (acc, issue) => {
      acc[issue.severity] += 1;
      return acc;
    },
    { critical: 0, warning: 0, suggestion: 0 }
  );
}

function buildScore(stats: BrandbookLintStats): number {
  const penalty = stats.critical * 20 + stats.warning * 8 + stats.suggestion * 3;
  return Math.max(0, Math.min(100, 100 - penalty));
}

function buildSummary(score: number, stats: BrandbookLintStats): string {
  if (stats.critical === 0 && stats.warning === 0 && stats.suggestion === 0) {
    return "Sem problemas determinísticos detectados: estrutura, produção e coerência operacional estão bem amarradas.";
  }
  if (stats.critical > 0) {
    return `Há ${stats.critical} item(ns) crítico(s) que comprometem execução, coerência ou handoff profissional do brandbook.`;
  }
  if (score >= 85) {
    return "O brandbook está sólido, mas ainda há ajustes determinísticos que elevam consistência operacional e prontidão de produção.";
  }
  return "O brandbook tem boa base, porém ainda carece de amarrações operacionais e cross-section para ficar realmente world-class.";
}

function typographyRoleExists(role: TypographyScaleItem["fontRole"], typography?: TypographySet): boolean {
  if (!typography) return false;
  return !!typography[role];
}

function pushIssue(
  issues: BrandbookLintIssue[],
  severity: BrandbookLintSeverity,
  area: string,
  issue: string,
  fix: string,
  fieldPaths?: string[]
) {
  issues.push({ severity, area, issue, fix, ...(fieldPaths && fieldPaths.length > 0 ? { fieldPaths } : {}) });
}

function lintTypographyScale(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const scale = brandbook.typographyScale ?? [];
  const normalizedNames = scale.map((item) => normalizeText(item.name));

  for (const [index, item] of scale.entries()) {
    if (!typographyRoleExists(item.fontRole, brandbook.typography)) {
      pushIssue(
        issues,
        "critical",
        "typographyScale",
        `A escala tipográfica usa o papel "${item.fontRole}" em "${item.name}", mas esse papel não existe em typography.`,
        `Adicione typography.${item.fontRole} ou troque typographyScale[${index}].fontRole para um papel existente.`,
        [`typographyScale.${index}.fontRole`, `typography.${item.fontRole}`]
      );
    }
  }

  const missingCore = TYPOGRAPHY_SCALE_CORE_NAMES.filter((name) => !normalizedNames.includes(name));
  if (missingCore.length > 0) {
    pushIssue(
      issues,
      "warning",
      "typographyScale",
      `A escala tipográfica não cobre níveis base esperados: ${missingCore.join(", ")}.`,
      "Inclua pelo menos Display, H1, Body e Caption para garantir hierarquia mínima consistente.",
      ["typographyScale"]
    );
  }

  const missingRecommended = TYPOGRAPHY_SCALE_RECOMMENDED_NAMES.filter((name) => !normalizedNames.includes(name));
  if (missingRecommended.length >= 3) {
    pushIssue(
      issues,
      "suggestion",
      "typographyScale",
      `A escala tipográfica ainda está curta para um sistema premium; faltam níveis como ${missingRecommended.slice(0, 4).join(", ")}.`,
      "Expanda a escala para cobrir display, títulos, corpo, caption e overline com uso explícito.",
      ["typographyScale"]
    );
  }
}

function lintApplications(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const applications = brandbook.applications ?? [];
  const incompleteFields = REQUIRED_APPLICATION_FIELDS.filter((field) =>
    applications.some((app) => {
      const value = app[field];
      if (Array.isArray(value)) return value.length === 0;
      return !isNonEmptyString(value);
    })
  );

  if (incompleteFields.length > 0) {
    pushIssue(
      issues,
      "warning",
      "applications",
      `As aplicações ainda não estão prontas para handoff completo; há lacunas em ${incompleteFields.join(", ")}.`,
      "Preencha dimensões, materiais, layout, hierarquia tipográfica, direção de arte e substratos em todas as peças.",
      ["applications"]
    );
  }

  const repeatedKeys = new Map<string, number>();
  for (const app of applications) {
    if (!app.imageKey) continue;
    repeatedKeys.set(app.imageKey, (repeatedKeys.get(app.imageKey) ?? 0) + 1);
  }
  const overused = Array.from(repeatedKeys.entries()).filter(([, count]) => count >= 3);
  if (overused.length > 0 && repeatedKeys.size <= 2 && applications.length >= 3) {
    pushIssue(
      issues,
      "suggestion",
      "applications",
      `O brandbook depende de poucos imageKeys nas aplicações (${overused.map(([key]) => key).join(", ")}), o que reduz variedade operacional.`,
      "Distribua imageKeys entre contextos diferentes para ampliar cobertura visual e de mockups.",
      ["applications"]
    );
  }
}

function lintProductionGuidelines(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const production = brandbook.productionGuidelines;
  if (!production) {
    pushIssue(
      issues,
      "critical",
      "productionGuidelines",
      "O brandbook não traz productionGuidelines; isso inviabiliza handoff profissional e consistência de execução.",
      "Adicione convenção de arquivos, checklist, specs de print/digital, entregáveis e métodos de produção.",
      ["productionGuidelines"]
    );
    return;
  }

  const checklistText = (production.handoffChecklist ?? []).join(" \n ");
  const normalizedChecklist = normalizeText(checklistText);
  const hasOutlineFonts = REQUIRED_PRODUCTION_CHECKLIST_HINTS.slice(0, 2).some((hint) => normalizedChecklist.includes(hint));
  const hasExpandStroke = REQUIRED_PRODUCTION_CHECKLIST_HINTS.slice(2).some((hint) => normalizedChecklist.includes(hint));

  if (!hasOutlineFonts) {
    pushIssue(
      issues,
      "warning",
      "productionGuidelines",
      'O handoff checklist não explicita "converter fontes em curvas / create outlines".',
      'Inclua uma etapa explícita para converter fontes em curvas antes do envio final para produção.',
      ["productionGuidelines.handoffChecklist"]
    );
  }

  if (!hasExpandStroke) {
    pushIssue(
      issues,
      "warning",
      "productionGuidelines",
      'O handoff checklist não explicita "expandir traços / outline stroke".',
      'Inclua uma etapa explícita para expandir traços antes do envio para gráficas e fornecedores.',
      ["productionGuidelines.handoffChecklist"]
    );
  }

  const digitalFormats = (production.digitalSpecs?.formats ?? []).map((item) => normalizeText(item));
  if (!digitalFormats.some((item) => item.includes("svg"))) {
    pushIssue(
      issues,
      "suggestion",
      "productionGuidelines",
      "Os formatos digitais não incluem SVG, o que enfraquece handoff vetorial para logo, ícones e peças escaláveis.",
      "Inclua SVG nos formatos digitais e, se aplicável, nos entregáveis principais do logo pack.",
      ["productionGuidelines.digitalSpecs.formats"]
    );
  }

  if (!production.productionMethods || production.productionMethods.length === 0) {
    pushIssue(
      issues,
      "suggestion",
      "productionGuidelines",
      "Os métodos de produção ainda não estão detalhados, reduzindo prontidão para print e materiais físicos.",
      "Adicione productionMethods com substrate, guidelines e restrictions por processo produtivo.",
      ["productionGuidelines.productionMethods"]
    );
  }
}

function lintColors(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const colorGroups: Array<[string, Color[]]> = [
    ["colors.primary", brandbook.colors?.primary ?? []],
    ["colors.secondary", brandbook.colors?.secondary ?? []],
  ];

  const nameMap = new Map<string, string[]>();
  const allNamedColors: Array<{ role: string; index: number; color: Color }> = [];
  for (const [role, colors] of colorGroups) {
    colors.forEach((color, index) => {
      allNamedColors.push({ role, index, color });
      const key = normalizeText(color.name);
      nameMap.set(key, [...(nameMap.get(key) ?? []), `${role}.${index}`]);
    });
  }

  const duplicateNames = Array.from(nameMap.entries()).filter(([, paths]) => paths.length > 1);
  if (duplicateNames.length > 0) {
    pushIssue(
      issues,
      "warning",
      "colors",
      `Há nomes de cor duplicados no sistema: ${duplicateNames.map(([name]) => name).join(", ")}.`,
      "Renomeie as cores para evitar ambiguidade operacional entre paleta primária e secundária.",
      duplicateNames.flatMap(([, paths]) => paths)
    );
  }

  for (const { role, index, color } of allNamedColors) {
    if (!color.usage) {
      pushIssue(
        issues,
        "warning",
        "colors",
        `A cor "${color.name}" não descreve uso operacional.`,
        "Preencha o campo usage para orientar aplicação em UI, peças impressas e direção de arte.",
        [`${role}.${index}.usage`]
      );
    }
  }

  const missingTonalScale = allNamedColors
    .filter(({ role, color }) => (role === "colors.primary" || role === "colors.secondary") && (!color.tonalScale || color.tonalScale.length < 5))
    .map(({ color }) => color.name);
  if (missingTonalScale.length > 0) {
    pushIssue(
      issues,
      "warning",
      "colors",
      `Algumas cores ainda não têm escala tonal robusta: ${missingTonalScale.join(", ")}.`,
      "Inclua tonalScale com shades claros e escuros para garantir uso consistente em digital e sistema visual.",
      ["colors.primary", "colors.secondary"]
    );
  }

  const missingPantonePrimary = (brandbook.colors?.primary ?? []).filter((color) => !isNonEmptyString(color.pantone));
  if (missingPantonePrimary.length > 0) {
    pushIssue(
      issues,
      "suggestion",
      "colors",
      `Cores primárias sem referência Pantone/verificação explícita: ${missingPantonePrimary.map((color) => color.name).join(", ")}.`,
      "Adicione Pantone confiável ou a observação de verificação com Color Bridge para materiais físicos.",
      ["colors.primary"]
    );
  }
}

function lintColorReferences(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const allColorNames = [...(brandbook.colors?.primary ?? []), ...(brandbook.colors?.secondary ?? [])]
    .map((color) => color.name)
    .filter(Boolean);

  if (allColorNames.length === 0) return;

  const referenceCorpus = COLOR_REFERENCE_SECTIONS.flatMap((section) => collectStrings(brandbook[section])).join("\n");
  const normalizedCorpus = normalizeText(referenceCorpus);
  const unreferenced = allColorNames.filter((name) => !normalizedCorpus.includes(normalizeText(name)));

  if (unreferenced.length >= Math.max(2, Math.ceil(allColorNames.length / 2))) {
    pushIssue(
      issues,
      "suggestion",
      "cross-section",
      `Boa parte da paleta não é citada nominalmente fora da própria seção de cores: ${unreferenced.slice(0, 4).join(", ")}${unreferenced.length > 4 ? "..." : ""}.`,
      "Reforce os nomes exatos das cores em typography, applications, key visual, produção e imageGenerationBriefing para aumentar governança operacional.",
      ["colors", ...COLOR_REFERENCE_SECTIONS]
    );
  }
}

function lintImageBriefing(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const brief = brandbook.imageGenerationBriefing;
  if (!brief) {
    pushIssue(
      issues,
      "warning",
      "imageGenerationBriefing",
      "O brandbook não possui imageGenerationBriefing, reduzindo consistência na geração de assets e campanhas.",
      "Adicione briefing visual com estilo, composição, referências, mood, bloco negativo e assinatura da marca.",
      ["imageGenerationBriefing"]
    );
    return;
  }

  const missing = REQUIRED_IMAGE_BRIEF_FIELDS.filter((field) => !isNonEmptyString(brief[field]));
  if (missing.length > 0) {
    pushIssue(
      issues,
      "suggestion",
      "imageGenerationBriefing",
      `O imageGenerationBriefing ainda não cobre campos world-class: ${missing.join(", ")}.`,
      "Complete os campos emocionais, táteis, de luz, câmera e sensorial para aumentar repetibilidade criativa.",
      missing.map((field) => `imageGenerationBriefing.${field}`)
    );
  }
}

function lintGovernance(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  if (!brandbook.governance) {
    pushIssue(
      issues,
      "warning",
      "governance",
      "O brandbook não documenta governança do sistema, o que enfraquece manutenção e evolução contínua.",
      "Adicione ownership, processo de update, versionamento, documentação e library/component workflow.",
      ["governance"]
    );
  }
}

function lintVerbalIdentity(brandbook: BrandbookData, issues: BrandbookLintIssue[]) {
  const verbal = brandbook.verbalIdentity;
  if (!verbal) return;

  if (!verbal.tonePerChannel || verbal.tonePerChannel.length < 3) {
    pushIssue(
      issues,
      "suggestion",
      "verbalIdentity",
      "A adaptação da voz por canal ainda está curta para operação omnichannel.",
      "Detalhe tonePerChannel para os canais mais relevantes, com tom e exemplo real por canal.",
      ["verbalIdentity.tonePerChannel"]
    );
  }

  if ((verbal.sampleHeadlines ?? []).length < 5) {
    pushIssue(
      issues,
      "suggestion",
      "verbalIdentity",
      "O repertório de headlines ainda está pequeno para campanhas, landing pages e social content.",
      "Expanda sampleHeadlines para cobrir marca, performance, institucional e sazonal.",
      ["verbalIdentity.sampleHeadlines"]
    );
  }
}

export function lintBrandbook(brandbook: BrandbookData): BrandbookLintReport {
  const issues: BrandbookLintIssue[] = [];

  lintTypographyScale(brandbook, issues);
  lintApplications(brandbook, issues);
  lintProductionGuidelines(brandbook, issues);
  lintColors(brandbook, issues);
  lintColorReferences(brandbook, issues);
  lintImageBriefing(brandbook, issues);
  lintGovernance(brandbook, issues);
  lintVerbalIdentity(brandbook, issues);

  const stats = buildStats(issues);
  const score = buildScore(stats);

  return {
    ok: stats.critical === 0,
    score,
    summary: buildSummary(score, stats),
    issues,
    stats,
  };
}
