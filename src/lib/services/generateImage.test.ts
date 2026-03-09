import { describe, expect, it } from "vitest";
import {
  extractNegativePrompt,
  pickGenerateImageAspectRatio,
  shouldUseGoogleGenerateContentModel,
} from "./generateImage";

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

  it("avoids Gemini preview for primary logos without references", () => {
    expect(
      shouldUseGoogleGenerateContentModel(
        "gemini-3.1-flash-image-preview",
        "logo_primary",
        false
      )
    ).toBe(false);
  });

  it("keeps Gemini path when reference images are present", () => {
    expect(
      shouldUseGoogleGenerateContentModel(
        "gemini-3.1-flash-image-preview",
        "logo_dark_bg",
        true
      )
    ).toBe(true);
  });
});
