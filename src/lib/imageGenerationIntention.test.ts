import { describe, expect, it } from "vitest";
import { caracaBarExample } from "./caraca-bar-example";
import { buildImageGenerationIntentSummary } from "./imageGenerationIntention";
import type { BrandbookData } from "./types";

const data = caracaBarExample as BrandbookData;

describe("imageGenerationIntention", () => {
  it("builds a 5-phase generative-intention summary with brand safeguards", () => {
    const summary = buildImageGenerationIntentSummary({
      brandbook: data,
      assetKey: "logo_primary",
    });

    expect(summary).toContain("PHASE_A_STRATEGIC_INTENT:");
    expect(summary).toContain("PHASE_B_SEMIOTIC_TRANSLATION:");
    expect(summary).toContain("PHASE_C_BLUEPRINT:");
    expect(summary).toContain("PHASE_D_DISTINCTIVENESS_GOVERNANCE:");
    expect(summary).toContain("PHASE_E_RECURSIVE_VALIDATION:");
    expect(summary).toContain("ANTI_BLANDING_PROTOCOL:");
    expect(summary).toContain("VALIDATION_AXES:");
    expect(summary).toContain("Caraca! Bar");
    expect(summary).toContain("FORBIDDEN_NAME_VARIANTS");
  });
});
