import type {
  AssetPackBucketQuality,
  AssetPackFile,
  AssetPackPlan,
  AssetPackPlanIcon,
  AssetPackQualityReport,
  AssetPackQualityStatus,
} from "@/lib/types";

const MAX_FILES = 40;
const MAX_CONTENT_CHARS = 260_000;
const SUSPICIOUS_NAME_FRAGMENTS = [
  "http",
  "https",
  "www",
  "placeholder",
  "undefined",
  "null",
  "lorem",
  "temp",
  "example",
  "mock",
  "sample",
  "image",
  "img",
  "blob",
  "base64",
];
const WEAK_ICON_TOKENS = new Set([
  "brand",
  "icon",
  "asset",
  "shape",
  "symbol",
  "graphic",
  "generic",
  "vector",
  "mark",
  "spark",
  "star",
  "emblem",
  "diamond",
]);

export type ExpectedAssetPackPaths = {
  icons: string[];
  elements: string[];
  patterns: string[];
  motion: string[];
  all: string[];
};

export type AssetPackCoverage = {
  icons: number;
  elements: number;
  patterns: number;
  motion: number;
  total: number;
  expectedTotal: number;
};

export type NormalizedAssetPackResult = {
  files: AssetPackFile[];
  coverage: AssetPackCoverage;
  quality: AssetPackQualityReport;
  issues: string[];
  missingPaths: string[];
  unexpectedPaths: string[];
  invalidSvgPaths: string[];
  suspiciousPaths: string[];
  isStructurallyComplete: boolean;
  passesQualityGate: boolean;
  isComplete: boolean;
};

export class AssetPackGenerationError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = "AssetPackGenerationError";
    this.issues = issues;
  }
}

export function safeRelPath(path: string): string | null {
  const normalized = path.replace(/\\/g, "/").trim();
  if (!normalized) return null;
  if (
    normalized.startsWith("/") ||
    normalized.startsWith("..") ||
    normalized.includes("/../") ||
    normalized.includes("\0")
  ) {
    return null;
  }
  if (normalized.length > 180) return null;
  return normalized;
}

export function buildExpectedAssetPackPaths(iconNames: string[], patternSlug: string): ExpectedAssetPackPaths {
  const icons = iconNames.map((name) => `vectors/icons/${name}.svg`);
  const elements = Array.from({ length: 8 }, (_, index) => `vectors/elements/element-${String(index + 1).padStart(2, "0")}.svg`);
  const patterns = [`vectors/patterns/pattern-${patternSlug}.svg`];
  const motion = ["motion/loading-spinner.svg", "motion/success-check.svg"];

  return {
    icons,
    elements,
    patterns,
    motion,
    all: [...icons, ...elements, ...patterns, ...motion],
  };
}

function uniqueCandidates(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function extractFirstJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function extractJsonCodeFence(raw: string): string | null {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() ?? null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStringList(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => readString(item))
    .filter(Boolean)
    .slice(0, limit);
}

function fileStem(path: string): string {
  return path.split("/").pop()?.replace(/\.svg$/i, "") ?? path;
}

function titleizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function tokenizeStem(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function rootStem(value: string): string {
  return value.replace(/-\d+$/i, "");
}

function hasSuspiciousFragment(value: string): boolean {
  const lower = value.toLowerCase();
  return SUSPICIOUS_NAME_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function countSvgPrimitiveTags(content: string): number {
  return (content.match(/<(path|circle|rect|ellipse|polygon|polyline|line|g|defs|pattern|use)\b/gi) ?? []).length;
}

function hasAnimationMarkup(content: string): boolean {
  return /<(animate|animateTransform|animateMotion|set)\b/i.test(content);
}

function makeBucketQuality(params: {
  bucket: AssetPackBucketQuality["bucket"];
  strengths: string[];
  softIssues: string[];
  hardIssues: string[];
}): AssetPackBucketQuality {
  const issues = [...params.hardIssues, ...params.softIssues];
  const score = Math.max(0, 100 - params.hardIssues.length * 35 - params.softIssues.length * 12);
  const status: AssetPackQualityStatus = params.hardIssues.length > 0 ? "fail" : params.softIssues.length > 0 ? "warn" : "pass";

  return {
    bucket: params.bucket,
    status,
    score,
    strengths: params.strengths,
    issues,
  };
}

function evaluateAssetPackQuality(params: {
  files: AssetPackFile[];
  expected: ExpectedAssetPackPaths;
  brandName?: string;
  plan?: AssetPackPlan;
}): {
  quality: AssetPackQualityReport;
  suspiciousPaths: string[];
} {
  const byPath = new Map(params.files.map((file) => [file.path, file]));
  const expectedSet = new Set(params.expected.all);
  const suspiciousPaths = params.files
    .filter((file) => expectedSet.has(file.path) && hasSuspiciousFragment(file.path))
    .map((file) => file.path);

  const iconFiles = params.expected.icons.map((path) => byPath.get(path)).filter(Boolean) as AssetPackFile[];
  const elementFiles = params.expected.elements.map((path) => byPath.get(path)).filter(Boolean) as AssetPackFile[];
  const patternFiles = params.expected.patterns.map((path) => byPath.get(path)).filter(Boolean) as AssetPackFile[];
  const motionFiles = params.expected.motion.map((path) => byPath.get(path)).filter(Boolean) as AssetPackFile[];

  const repeatedRoots = new Map<string, number>();
  for (const file of iconFiles) {
    const root = rootStem(fileStem(file.path));
    repeatedRoots.set(root, (repeatedRoots.get(root) ?? 0) + 1);
  }

  const numberedIconCount = iconFiles.filter((file) => /-\d+$/i.test(fileStem(file.path))).length;
  const weakIconNames = iconFiles
    .filter((file) => {
      const tokens = tokenizeStem(fileStem(file.path));
      return tokens.length > 0 && tokens.every((token) => WEAK_ICON_TOKENS.has(token) || /^\d+$/.test(token));
    })
    .map((file) => file.path);
  const lowDetailElements = elementFiles.filter((file) => countSvgPrimitiveTags(file.content) < 6).map((file) => file.path);
  const lowDetailIcons = iconFiles.filter((file) => countSvgPrimitiveTags(file.content) < 3).map((file) => file.path);
  const invalidPatterns = patternFiles.filter((file) => !/<pattern\b/i.test(file.content) || !/<defs\b/i.test(file.content)).map((file) => file.path);
  const invalidMotion = motionFiles.filter((file) => !hasAnimationMarkup(file.content)).map((file) => file.path);
  const planMismatchIcons = params.plan
    ? params.plan.iconPlan
        .filter((entry) => !params.expected.icons.includes(entry.path))
        .map((entry) => entry.path)
    : [];

  const iconSoftIssues: string[] = [];
  const iconHardIssues: string[] = [];
  const repeatedFamilies = Array.from(repeatedRoots.entries()).filter(([, count]) => count >= 3);

  if (iconFiles.length < params.expected.icons.length) {
    iconHardIssues.push(`Cobertura incompleta de ícones (${iconFiles.length}/${params.expected.icons.length}).`);
  }
  if (suspiciousPaths.some((path) => path.startsWith("vectors/icons/"))) {
    iconHardIssues.push("Há nomes de ícones contaminados por placeholders, URLs ou tokens inválidos.");
  }
  if (lowDetailIcons.length > 0) {
    iconHardIssues.push(`Há ${lowDetailIcons.length} ícone(s) sem detalhe vetorial mínimo.`);
  }
  if (weakIconNames.length >= 6) {
    iconSoftIssues.push("Muitos ícones ainda usam semântica fraca demais e tendem a soar genéricos.");
  }
  if (numberedIconCount >= 5) {
    iconSoftIssues.push("Há ícones demais dependentes de sufixos numéricos, sugerindo fallback genérico em excesso.");
  }
  if (repeatedFamilies.length > 0) {
    iconSoftIssues.push(`Algumas famílias de ícones estão repetidas demais: ${repeatedFamilies.map(([root, count]) => `${root} (${count})`).join(", ")}.`);
  }

  const elementSoftIssues: string[] = [];
  const elementHardIssues: string[] = [];
  if (elementFiles.length < params.expected.elements.length) {
    elementHardIssues.push(`Cobertura incompleta de elementos (${elementFiles.length}/${params.expected.elements.length}).`);
  }
  if (lowDetailElements.length >= 3) {
    elementHardIssues.push("Elementos abstratos demais foram retornados simples demais para uso premium.");
  } else if (lowDetailElements.length > 0) {
    elementSoftIssues.push(`Há ${lowDetailElements.length} elemento(s) abstrato(s) com pouca elaboração vetorial.`);
  }

  const patternSoftIssues: string[] = [];
  const patternHardIssues: string[] = [];
  if (patternFiles.length < params.expected.patterns.length) {
    patternHardIssues.push("O padrão seamless obrigatório não foi entregue.");
  }
  if (invalidPatterns.length > 0) {
    patternHardIssues.push("O padrão não trouxe estrutura real de tile com <defs><pattern>.");
  }

  const motionSoftIssues: string[] = [];
  const motionHardIssues: string[] = [];
  if (motionFiles.length < params.expected.motion.length) {
    motionHardIssues.push(`Cobertura incompleta de motion (${motionFiles.length}/${params.expected.motion.length}).`);
  }
  if (invalidMotion.length > 0) {
    motionHardIssues.push("Há motion SVG sem animação declarada no markup.");
  }

  const buckets: AssetPackBucketQuality[] = [
    makeBucketQuality({
      bucket: "icons",
      strengths: [
        `${iconFiles.length}/${params.expected.icons.length} ícones entregues.`,
        params.plan?.bucketDirectives.icons || `Vocabulário guiado para ${params.brandName || "a marca"}.`,
      ],
      softIssues: iconSoftIssues,
      hardIssues: [...iconHardIssues, ...(planMismatchIcons.length > 0 ? ["O plano de ícones retornou paths fora da lista obrigatória."] : [])],
    }),
    makeBucketQuality({
      bucket: "elements",
      strengths: [
        `${elementFiles.length}/${params.expected.elements.length} elementos entregues.`,
        params.plan?.bucketDirectives.elements || "Elementos abstratos orientados para uso de sistema visual.",
      ],
      softIssues: elementSoftIssues,
      hardIssues: elementHardIssues,
    }),
    makeBucketQuality({
      bucket: "patterns",
      strengths: [
        `${patternFiles.length}/${params.expected.patterns.length} padrão entregue.`,
        params.plan?.bucketDirectives.patterns || "Pattern voltado a repetição contínua e handoff.",
      ],
      softIssues: patternSoftIssues,
      hardIssues: patternHardIssues,
    }),
    makeBucketQuality({
      bucket: "motion",
      strengths: [
        `${motionFiles.length}/${params.expected.motion.length} motion SVGs entregues.`,
        params.plan?.bucketDirectives.motion || "Motion alinhado ao gesto da marca.",
      ],
      softIssues: motionSoftIssues,
      hardIssues: motionHardIssues,
    }),
  ];

  const issues = buckets.flatMap((bucket) => bucket.status === "fail" ? bucket.issues.map((issue) => `[${bucket.bucket}] ${issue}`) : []);
  const warnings = buckets.flatMap((bucket) => bucket.status === "warn" ? bucket.issues.map((issue) => `[${bucket.bucket}] ${issue}`) : []);
  const strengths = buckets.flatMap((bucket) => bucket.strengths.slice(0, 2));
  const score = Math.max(0, Math.round(buckets.reduce((sum, bucket) => sum + bucket.score, 0) / buckets.length));
  const status: AssetPackQualityStatus = buckets.some((bucket) => bucket.status === "fail") ? "fail" : buckets.some((bucket) => bucket.status === "warn") ? "warn" : "pass";
  const summary = status === "pass"
    ? "Asset Pack aprovado com cobertura e direção criativa consistentes."
    : status === "warn"
      ? "Asset Pack utilizável, mas ainda com sinais de genericidade ou direção visual fraca em parte dos buckets."
      : "Asset Pack reprovado por problemas semânticos ou estruturais que comprometem a qualidade do handoff.";

  return {
    suspiciousPaths,
    quality: {
      status,
      score,
      summary,
      strengths,
      warnings,
      issues,
      buckets,
    },
  };
}

export function parseAssetPackModelResponse(raw: string): unknown {
  const candidates = uniqueCandidates([raw, extractJsonCodeFence(raw), extractFirstJsonObject(raw)]);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new AssetPackGenerationError("IA retornou JSON inválido para o Asset Pack.", ["A resposta da IA não pôde ser convertida em JSON válido."]);
}

function normalizePlanIcon(raw: unknown, fallbackPath: string): AssetPackPlanIcon {
  const item = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const path = safeRelPath(readString(item.path)) || fallbackPath;
  const stem = fileStem(path);
  const label = readString(item.label) || titleizeSlug(stem);
  const concept = readString(item.concept) || label;
  const rationale = readString(item.rationale) || `Representar ${concept.toLowerCase()} com personalidade própria da marca.`;

  return {
    path: fallbackPath,
    label,
    concept,
    rationale,
  };
}

export function parseAssetPackPlanResponse(raw: string, expected: ExpectedAssetPackPaths): AssetPackPlan {
  const parsed = parseAssetPackModelResponse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new AssetPackGenerationError("IA não retornou um plano válido para o Asset Pack.", ["O plano retornado não é um objeto JSON válido."]);
  }

  const data = parsed as Record<string, unknown>;
  const iconPlanRaw = Array.isArray(data.iconPlan) ? data.iconPlan : [];
  const iconPlan = expected.icons.map((path, index) => normalizePlanIcon(iconPlanRaw[index], path));

  return {
    creativeThesis: readString(data.creativeThesis) || "Construir um sistema de assets reconhecível, expressivo e diretamente ligado ao universo da marca.",
    shapeLanguage: readStringList(data.shapeLanguage, 6),
    coreMotifs: readStringList(data.coreMotifs, 8),
    avoidMotifs: readStringList(data.avoidMotifs, 8),
    bucketDirectives: {
      icons: readString((data.bucketDirectives as Record<string, unknown> | undefined)?.icons) || "Cada ícone precisa parecer parte de uma mesma família proprietária, evitando semântica de UI genérica.",
      elements: readString((data.bucketDirectives as Record<string, unknown> | undefined)?.elements) || "Os elementos abstratos devem funcionar como matéria-prima premium para embalagem, posts e papelaria.",
      patterns: readString((data.bucketDirectives as Record<string, unknown> | undefined)?.patterns) || "O padrão precisa ser realmente tileável e carregar ritmo visual reconhecível da marca.",
      motion: readString((data.bucketDirectives as Record<string, unknown> | undefined)?.motion) || "Os motions devem animar gestos da marca, sem recorrer a loaders genéricos.",
    },
    iconPlan,
  };
}

function isSvgContent(content: string): boolean {
  return /<svg[\s>]/i.test(content.trim());
}

export function normalizeAssetPackFiles(
  parsed: unknown,
  expected: ExpectedAssetPackPaths,
  options: {
    brandName?: string;
    plan?: AssetPackPlan;
  } = {}
): NormalizedAssetPackResult {
  const filesRaw = (parsed as { files?: unknown })?.files;
  if (!Array.isArray(filesRaw)) {
    throw new AssetPackGenerationError("IA não retornou `files` como array no Asset Pack.", ["O JSON retornado não contém `files` como array."]);
  }

  const issues: string[] = [];
  const byPath = new Map<string, AssetPackFile>();

  for (const file of filesRaw.slice(0, MAX_FILES)) {
    if (!file || typeof file !== "object") {
      issues.push("Um item de `files` foi ignorado porque não era um objeto válido.");
      continue;
    }

    const path = typeof (file as { path?: unknown }).path === "string"
      ? safeRelPath((file as { path: string }).path)
      : null;
    const content = (file as { content?: unknown }).content;

    if (!path) {
      issues.push("Um arquivo foi ignorado porque o `path` é inseguro ou inválido.");
      continue;
    }

    if (typeof content !== "string") {
      issues.push(`O arquivo ${path} foi ignorado porque o conteúdo não é string.`);
      continue;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      issues.push(`O arquivo ${path} foi ignorado porque o conteúdo está vazio.`);
      continue;
    }

    if (trimmed.length > MAX_CONTENT_CHARS) {
      issues.push(`O arquivo ${path} foi ignorado porque ultrapassa o limite máximo de caracteres.`);
      continue;
    }

    if (byPath.has(path)) {
      issues.push(`O arquivo ${path} apareceu duplicado; a última versão foi mantida.`);
    }

    byPath.set(path, { path, content: trimmed.endsWith("\n") ? trimmed : `${trimmed}\n` });
  }

  const files = Array.from(byPath.values());
  const filePathSet = new Set(files.map((file) => file.path));

  const missingPaths = expected.all.filter((path) => !filePathSet.has(path));
  const unexpectedPaths = files
    .map((file) => file.path)
    .filter((path) => !expected.all.includes(path));
  const invalidSvgPaths = files
    .filter((file) => expected.all.includes(file.path) && !isSvgContent(file.content))
    .map((file) => file.path);

  const coverage: AssetPackCoverage = {
    icons: expected.icons.filter((path) => filePathSet.has(path)).length,
    elements: expected.elements.filter((path) => filePathSet.has(path)).length,
    patterns: expected.patterns.filter((path) => filePathSet.has(path)).length,
    motion: expected.motion.filter((path) => filePathSet.has(path)).length,
    total: expected.all.filter((path) => filePathSet.has(path)).length,
    expectedTotal: expected.all.length,
  };

  if (missingPaths.length > 0) {
    issues.push(`Faltam ${missingPaths.length} arquivo(s) obrigatório(s) no Asset Pack.`);
  }
  if (invalidSvgPaths.length > 0) {
    issues.push(`Há ${invalidSvgPaths.length} arquivo(s) obrigatório(s) sem markup SVG válido.`);
  }

  const { quality, suspiciousPaths } = evaluateAssetPackQuality({
    files,
    expected,
    brandName: options.brandName,
    plan: options.plan,
  });

  const isStructurallyComplete = missingPaths.length === 0 && invalidSvgPaths.length === 0;
  const passesQualityGate = quality.status !== "fail";
  const isComplete = isStructurallyComplete && passesQualityGate;

  return {
    files,
    coverage,
    quality,
    issues: [...issues, ...quality.issues, ...quality.warnings],
    missingPaths,
    unexpectedPaths,
    invalidSvgPaths,
    suspiciousPaths,
    isStructurallyComplete,
    passesQualityGate,
    isComplete,
  };
}

export function buildAssetPackRepairPrompt(params: {
  brandName: string;
  expected: ExpectedAssetPackPaths;
  raw: string;
  issues: string[];
  plan?: AssetPackPlan;
}): string {
  const issueList = params.issues.length > 0 ? params.issues.map((issue) => `- ${issue}`).join("\n") : "- A resposta anterior não atendeu ao formato/cobertura/qualidade exigidos.";
  const expectedList = params.expected.all.map((path) => `- ${path}`).join("\n");

  return [
    `Sua resposta anterior para o Asset Pack da marca \"${params.brandName}\" ficou inválida, incompleta ou genérica demais.`,
    "Reescreva o JSON COMPLETO do zero, sem markdown, sem comentários e sem texto extra.",
    "Você DEVE retornar `files` como array e incluir TODOS os paths obrigatórios abaixo, cada um com SVG válido e detalhado em `content`.",
    "",
    "REGRAS CRÍTICAS DE QUALIDADE PROFISSIONAL:",
    "- Ícones: MÍNIMO 3 primitivas SVG (<path>, <circle>, <rect>, etc.) — SVGs com menos de 3 primitivas são REJEITADOS.",
    "- Elementos: MÍNIMO 6 primitivas SVG — são composições visuais complexas premium, NÃO formas geométricas simples.",
    "- Patterns DEVEM usar <defs><pattern id=\"tile\"...> com patternUnits para ser realmente tileável.",
    "- Motion SVGs DEVEM ter <animate> ou <animateTransform> — sem animação = rejeitado.",
    "- NUNCA use URLs, placeholders ou tokens genéricos nos nomes dos arquivos.",
    "- Cada SVG deve ser VISUALMENTE RICO e profissional. Um círculo + uma linha NÃO é um ícone aceitável.",
    "- Use fills, strokes, gradients e composições com camadas para criar assets de qualidade world-class.",
    "",
    "Além da cobertura, corrija genericidade, nomes contaminados, falta de animação e qualquer fraqueza de direção criativa apontada.",
    "",
    "Problemas detectados:",
    issueList,
    "",
    ...(params.plan
      ? [
          "Plano criativo obrigatório para seguir:",
          JSON.stringify(params.plan, null, 2),
          "",
        ]
      : []),
    "Paths obrigatórios:",
    expectedList,
    "",
    "Resposta anterior para corrigir:",
    params.raw,
  ].join("\n");
}
