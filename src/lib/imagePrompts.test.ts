import { describe, expect, it } from "vitest";
import { buildApplicationPrompt, buildImagePrompt } from "./imagePrompts";
import { caracaBarExample } from "./caraca-bar-example";
import type { Application, BrandbookData } from "./types";

const data = caracaBarExample as BrandbookData;

describe("imagePrompts naming fidelity", () => {
  it("hardens logo prompts with canonical naming and logo governance", () => {
    const prompt = buildImagePrompt("logo_primary", data, "imagen");

    expect(prompt).toContain("CANONICAL_BRAND_NAME: Caraca! Bar.");
    expect(prompt).toContain('EXACT_BRAND_TEXT: The wordmark must render exactly "Caraca! Bar"');
    expect(prompt).toContain("LOGO_CLEAR_SPACE:");
    expect(prompt).toContain("LOGO_MINIMUM_SIZE:");
    expect(prompt).toContain("LOGO_INCORRECT_USAGES:");
    expect(prompt).toContain("FORBIDDEN_NAME_VARIANTS:");
    expect(prompt).toContain("Caraça Bar");
  });

  it("propagates exact brand-text fidelity to logo-visible applications", () => {
    const app: Application = {
      type: "Cartão de visita",
      description: "Aplicação impressa com logo e wordmark visíveis",
      imagePlaceholder: "https://placehold.co/1200x800",
    };

    const prompt = buildApplicationPrompt(app, data, "imagen", "4:3");

    expect(prompt).toContain('EXACT_BRAND_TEXT: Any readable brand text or logo text must match "Caraca! Bar" exactly whenever the brand name appears.');
    expect(prompt).toContain("FORBIDDEN_NAME_VARIANTS:");
  });
});
