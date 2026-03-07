import { describe, expect, it } from "vitest";
import { saasExample } from "@/lib/examples";
import { lintBrandbook } from "@/lib/brandbookLinter";

describe("brandbookLinter", () => {
  it("returns a deterministic report for a valid brandbook object", () => {
    const report = lintBrandbook(saasExample);

    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(report.stats.warning + report.stats.suggestion + report.stats.critical).toBe(report.issues.length);
    expect(report.issues.some((issue) => issue.area === "productionGuidelines")).toBe(true);
  });

  it("flags missing production guidelines as a critical handoff issue", () => {
    const report = lintBrandbook({
      ...saasExample,
      productionGuidelines: undefined,
    });

    expect(report.ok).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "critical",
          area: "productionGuidelines",
        }),
      ])
    );
  });

  it("flags typography scale roles that do not exist in typography", () => {
    const report = lintBrandbook({
      ...saasExample,
      typography: {
        ui: saasExample.typography.ui,
        monospace: saasExample.typography.monospace,
      },
      typographyScale: [
        {
          name: "H1",
          fontRole: "marketing",
          size: "48px",
          lineHeight: "56px",
          fontWeight: "800",
          usage: "Hero",
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "critical",
          area: "typographyScale",
        }),
      ])
    );
  });
});
