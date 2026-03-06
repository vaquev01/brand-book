import { describe, expect, it } from "vitest";
import { extractNegativePrompt, pickGenerateImageAspectRatio } from "./generateImage";

describe("generateImage service helpers", () => {
  it("extracts the inline --neg prompt suffix", () => {
    expect(extractNegativePrompt("hero prompt --neg blurry watermark")).toEqual({
      positive: "hero prompt",
      negative: "blurry watermark",
    });
  });

  it("extracts block negative sections", () => {
    expect(
      extractNegativePrompt("Hero prompt\n\nDo not include: blurry, watermark.")
    ).toEqual({
      positive: "Hero prompt",
      negative: "blurry, watermark",
    });
  });

  it("derives aspect ratio from the explicit parameter first", () => {
    expect(pickGenerateImageAspectRatio("logo_primary", "16:9")).toBe("16:9");
  });

  it("falls back to the asset catalog aspect ratio", () => {
    expect(pickGenerateImageAspectRatio("instagram_story")).toBe("9:16");
  });
});
