import { describe, expect, it } from "vitest";
import { caracaBarExample } from "./caraca-bar-example";
import { migrateBrandbook } from "./brandbookMigration";
import { validateLooseBrandbook } from "./brandbookValidation";
import type { BrandbookData } from "./types";

function buildLegacyCaracaExample(): BrandbookData {
  return {
    ...(caracaBarExample as BrandbookData),
    applications: (caracaBarExample as BrandbookData).applications.map((app) =>
      app.type === "Destaques do Instagram"
        ? { ...app, imageKey: "social_story" }
        : { ...app }
    ),
  };
}

describe("brandbookMigration", () => {
  it("normalizes legacy social_story application keys", () => {
    const migrated = migrateBrandbook(buildLegacyCaracaExample());
    const highlightsApp = migrated.applications.find((app) => app.type === "Destaques do Instagram");

    expect(highlightsApp?.imageKey).toBe("instagram_story");
  });

  it("accepts legacy social_story keys during loose validation", () => {
    const validated = validateLooseBrandbook(buildLegacyCaracaExample(), {
      action: "carregar exemplo",
      subject: "Brandbook de exemplo",
    });
    const highlightsApp = validated.applications.find((app) => app.type === "Destaques do Instagram");

    expect(highlightsApp?.imageKey).toBe("instagram_story");
  });

  it("keeps the current Caraca example valid", () => {
    const validated = validateLooseBrandbook(caracaBarExample, {
      action: "carregar exemplo",
      subject: "Brandbook de exemplo",
    });
    const highlightsApp = validated.applications.find((app) => app.type === "Destaques do Instagram");

    expect(validated.brandName).toBe("Caraca! Bar");
    expect(highlightsApp?.imageKey).toBe("instagram_story");
  });
});
