import { describe, expect, it } from "vitest";
import type { BrandbookLintReport } from "@/lib/brandbookLinter";
import { getProfessionalExportGateSummary, getProtectedExportGuard, hasCriticalLintIssues } from "@/lib/brandbookQualityGate";

function makeReport(overrides: Partial<BrandbookLintReport> = {}): BrandbookLintReport {
  return {
    ok: true,
    score: 92,
    summary: "ok",
    issues: [],
    stats: {
      critical: 0,
      warning: 0,
      suggestion: 0,
    },
    ...overrides,
  };
}

describe("brandbookQualityGate", () => {
  it("allows protected exports when there are no critical lint issues", () => {
    const report = makeReport();

    expect(hasCriticalLintIssues(report)).toBe(false);
    expect(getProtectedExportGuard("pack", report)).toEqual({ allowed: true });
  });

  it("blocks protected exports when critical lint issues exist", () => {
    const report = makeReport({
      ok: false,
      score: 61,
      stats: {
        critical: 2,
        warning: 1,
        suggestion: 0,
      },
    });

    const guard = getProtectedExportGuard("production_manifest", report);
    expect(guard.allowed).toBe(false);
    expect(guard.reason).toContain("Manifesto de Produção");
    expect(guard.reason).toContain("2 item(ns) crítico(s)");
  });

  it("returns the correct quality gate summary for blocked and warning states", () => {
    const blocked = getProfessionalExportGateSummary(
      makeReport({
        ok: false,
        score: 54,
        stats: {
          critical: 1,
          warning: 2,
          suggestion: 3,
        },
      })
    );
    const caution = getProfessionalExportGateSummary(
      makeReport({
        score: 85,
        stats: {
          critical: 0,
          warning: 2,
          suggestion: 1,
        },
      })
    );

    expect(blocked.tone).toBe("red");
    expect(blocked.blocked).toBe(true);
    expect(caution.tone).toBe("amber");
    expect(caution.blocked).toBe(false);
  });
});
