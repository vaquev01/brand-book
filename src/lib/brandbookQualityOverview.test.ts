import { describe, expect, it } from "vitest";
import { buildBrandbookQualityOverview } from "@/lib/brandbookQualityOverview";

describe("brandbookQualityOverview", () => {
  it("returns gray when no signals are available", () => {
    const result = buildBrandbookQualityOverview({});

    expect(result.score).toBeNull();
    expect(result.tone).toBe("gray");
    expect(result.coverage).toEqual({ ai: false, lint: false, system: false });
  });

  it("returns red when any critical issue exists across signals", () => {
    const result = buildBrandbookQualityOverview({
      aiReport: {
        score: 88,
        issues: [{ severity: "critical" }],
      },
      lintReport: {
        ok: true,
        score: 91,
        summary: "ok",
        issues: [],
        stats: { critical: 0, warning: 1, suggestion: 0 },
      },
      systemReport: {
        ok: true,
        issues: [],
      },
    });

    expect(result.tone).toBe("red");
    expect(result.totals.critical).toBe(1);
  });

  it("returns green for strong scores with no criticals or warnings", () => {
    const result = buildBrandbookQualityOverview({
      aiReport: {
        score: 94,
        issues: [],
      },
      lintReport: {
        ok: true,
        score: 96,
        summary: "ok",
        issues: [],
        stats: { critical: 0, warning: 0, suggestion: 1 },
      },
      systemReport: {
        ok: true,
        issues: [],
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.tone).toBe("green");
  });
});
