import { describe, expect, it } from "vitest";
import {
  AssetPackGenerationError,
  buildExpectedAssetPackPaths,
  normalizeAssetPackFiles,
  parseAssetPackModelResponse,
  safeRelPath,
} from "./generateAssetPack";

function svgForPath(path: string): string {
  if (path.startsWith("vectors/elements/")) {
    return [
      '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
      '<rect x="48" y="48" width="180" height="180" rx="40" fill="none" stroke="#111"/>',
      '<circle cx="320" cy="160" r="72" fill="none" stroke="#111"/>',
      '<path d="M96 352C180 280 284 280 392 400" fill="none" stroke="#111"/>',
      '</svg>',
    ].join("");
  }

  if (path.startsWith("vectors/patterns/")) {
    return [
      '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">',
      '<defs>',
      '<pattern id="tile" width="80" height="80" patternUnits="userSpaceOnUse">',
      '<rect width="80" height="80" fill="none"/>',
      '<circle cx="20" cy="20" r="10" fill="#111"/>',
      '<path d="M40 10L70 40L40 70L10 40Z" fill="none" stroke="#111"/>',
      '</pattern>',
      '</defs>',
      '<rect width="400" height="400" fill="url(#tile)"/>',
      '</svg>',
    ].join("");
  }

  if (path.startsWith("motion/")) {
    return [
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="32" cy="32" r="18" fill="none" stroke="#111">',
      '<animate attributeName="stroke-dashoffset" values="0;32" dur="1.2s" repeatCount="indefinite"/>',
      '</circle>',
      '<path d="M20 32H44" stroke="#111">',
      '<animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1.2s" repeatCount="indefinite"/>',
      '</path>',
      '</svg>',
    ].join("");
  }

  return [
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    `<title>${path}</title>`,
    '<path d="M4 12L12 4L20 12" fill="none" stroke="#111"/>',
    '</svg>',
  ].join("");
}

function buildCompleteFiles() {
  const expected = buildExpectedAssetPackPaths(["brand-mark", "leaf", "sun", "bird", "wave", "seed", "cup", "toast", "menu", "wood", "kraft", "tropical", "boteco", "flora", "fauna", "warmth"], "caraca-bar");
  return {
    expected,
    parsed: {
      files: expected.all.map((path) => ({
        path,
        content: svgForPath(path),
      })),
    },
  };
}

describe("generateAssetPack service", () => {
  it("parses wrapped JSON model responses", () => {
    expect(parseAssetPackModelResponse("```json\n{\"files\":[]}\n```"))
      .toEqual({ files: [] });
  });

  it("normalizes a complete asset pack with full expected coverage", () => {
    const { expected, parsed } = buildCompleteFiles();
    const normalized = normalizeAssetPackFiles(parsed, expected);

    expect(normalized.isComplete).toBe(true);
    expect(normalized.passesQualityGate).toBe(true);
    expect(normalized.coverage.total).toBe(expected.all.length);
    expect(normalized.coverage.icons).toBe(16);
    expect(normalized.coverage.elements).toBe(8);
    expect(normalized.coverage.patterns).toBe(1);
    expect(normalized.coverage.motion).toBe(2);
    expect(normalized.missingPaths).toEqual([]);
    expect(normalized.invalidSvgPaths).toEqual([]);
    expect(normalized.quality.status).toBe("pass");
  });

  it("reports missing required files when the pack is incomplete", () => {
    const { expected, parsed } = buildCompleteFiles();
    const incomplete = {
      files: parsed.files.slice(0, parsed.files.length - 3),
    };
    const normalized = normalizeAssetPackFiles(incomplete, expected);

    expect(normalized.isComplete).toBe(false);
    expect(normalized.missingPaths.length).toBe(3);
    expect(normalized.issues.some((issue) => issue.includes("Faltam 3 arquivo(s) obrigatório(s)"))).toBe(true);
  });

  it("rejects responses that do not expose a files array", () => {
    expect(() => normalizeAssetPackFiles({ nope: true }, buildExpectedAssetPackPaths(["icon-a"], "brand")))
      .toThrow(AssetPackGenerationError);
  });

  it("accepts only safe relative paths", () => {
    expect(safeRelPath("vectors/icons/brand.svg")).toBe("vectors/icons/brand.svg");
    expect(safeRelPath("../secret.svg")).toBeNull();
    expect(safeRelPath("/absolute/file.svg")).toBeNull();
  });
});
