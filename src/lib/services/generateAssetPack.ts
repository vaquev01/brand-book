import type { AssetPackFile } from "@/lib/types";

const MAX_FILES = 40;
const MAX_CONTENT_CHARS = 260_000;

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
  issues: string[];
  missingPaths: string[];
  unexpectedPaths: string[];
  invalidSvgPaths: string[];
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

function isSvgContent(content: string): boolean {
  return /<svg[\s>]/i.test(content.trim());
}

export function normalizeAssetPackFiles(
  parsed: unknown,
  expected: ExpectedAssetPackPaths
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

  return {
    files,
    coverage,
    issues,
    missingPaths,
    unexpectedPaths,
    invalidSvgPaths,
    isComplete: missingPaths.length === 0 && invalidSvgPaths.length === 0,
  };
}

export function buildAssetPackRepairPrompt(params: {
  brandName: string;
  expected: ExpectedAssetPackPaths;
  raw: string;
  issues: string[];
}): string {
  const issueList = params.issues.length > 0 ? params.issues.map((issue) => `- ${issue}`).join("\n") : "- A resposta anterior não atendeu ao formato/cobertura exigidos.";
  const expectedList = params.expected.all.map((path) => `- ${path}`).join("\n");

  return [
    `Sua resposta anterior para o Asset Pack da marca \"${params.brandName}\" ficou inválida ou incompleta.`,
    "Reescreva o JSON COMPLETO do zero, sem markdown, sem comentários e sem texto extra.",
    "Você DEVE retornar `files` como array e incluir TODOS os paths obrigatórios abaixo, cada um com SVG válido em `content`.",
    "",
    "Problemas detectados:",
    issueList,
    "",
    "Paths obrigatórios:",
    expectedList,
    "",
    "Resposta anterior para corrigir:",
    params.raw,
  ].join("\n");
}
