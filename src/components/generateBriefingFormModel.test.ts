import { describe, expect, it } from "vitest";
import {
  composeBriefing,
  countFilledGuidedFields,
  createEmptyGuidedBriefing,
  parseExternalUrls,
} from "./generateBriefingFormModel";

describe("generateBriefingFormModel", () => {
  it("creates an empty guided briefing", () => {
    expect(createEmptyGuidedBriefing()).toEqual({
      whatItDoes: "",
      targetAudience: "",
      positioning: "",
      references: "",
      instagramLinks: "",
      essenceReferences: "",
      avoidances: "",
      colorPreferences: "",
      hasMascot: false,
      mascotDescription: "",
      extraContext: "",
      brandValues: "",
      emotionalTerritory: "",
      physicalTouchpoints: "",
      competitorWeaknesses: "",
    });
  });

  it("counts filled guided fields", () => {
    const guided = {
      ...createEmptyGuidedBriefing(),
      whatItDoes: "Café artesanal",
      targetAudience: "Público urbano",
      hasMascot: true,
    };

    expect(countFilledGuidedFields(guided)).toBe(3);
  });

  it("composes guided and raw briefing into structured text", () => {
    const guided = {
      ...createEmptyGuidedBriefing(),
      whatItDoes: "Plataforma de agendamento",
      colorPreferences: "Evitar azul",
      hasMascot: true,
      mascotDescription: "Uma raposa minimalista",
    };

    expect(composeBriefing(guided, "Contexto extra")).toContain("══ O QUE A MARCA FAZ ══");
    expect(composeBriefing(guided, "Contexto extra")).toContain("Uma raposa minimalista");
    expect(composeBriefing(guided, "Contexto extra")).toContain("══ BRIEFING LIVRE ══");
  });

  it("normalizes and filters external urls", () => {
    const result = parseExternalUrls("@marca\nwww.site.com\nhttps://example.com\nfoo");

    expect(result).toEqual([
      "https://www.instagram.com/marca/",
      "https://www.site.com",
      "https://example.com",
    ]);
  });
});
