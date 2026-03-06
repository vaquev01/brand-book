import { describe, expect, it } from "vitest";
import { buildPngDownloadName } from "./browserDownload";

describe("buildPngDownloadName", () => {
  it("slugifies the base name", () => {
    expect(buildPngDownloadName("Caraca! Bar")).toBe("caraca-bar.png");
  });

  it("slugifies and appends the optional suffix", () => {
    expect(buildPngDownloadName("Caraca! Bar", "Hero Visual")).toBe("caraca-bar-hero-visual.png");
  });
});
