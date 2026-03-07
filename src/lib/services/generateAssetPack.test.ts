import { describe, expect, it } from "vitest";
import {
  AssetPackGenerationError,
  buildExpectedAssetPackPaths,
  normalizeAssetPackFiles,
  parseAssetPackModelResponse,
  safeRelPath,
} from "./generateAssetPack";

function buildCompleteFiles() {
  const expected = buildExpectedAssetPackPaths(["brand-mark", "leaf", "sun", "bird", "wave", "seed", "cup", "toast", "menu", "wood", "kraft", "tropical", "boteco", "flora", "fauna", "warmth"], "caraca-bar");
  return {
    expected,
    parsed: {
      files: expected.all.map((path) => ({
        path,
        content: `<svg viewBox="0 0 24 24"><title>${path}</title></svg>`,
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
    expect(normalized.coverage.total).toBe(expected.all.length);
    expect(normalized.coverage.icons).toBe(16);
    expect(normalized.coverage.elements).toBe(8);
    expect(normalized.coverage.patterns).toBe(1);
    expect(normalized.coverage.motion).toBe(2);
    expect(normalized.missingPaths).toEqual([]);
    expect(normalized.invalidSvgPaths).toEqual([]);
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
