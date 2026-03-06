import { describe, expect, it } from "vitest";
import { parseGenerateInput, safeParseJson } from "./generate";

describe("generate service helpers", () => {
  it("parses and defaults the generate input", () => {
    const input = parseGenerateInput({
      brandName: "Marca",
      industry: "Food",
      briefing: "Teste",
      provider: "openai",
      referenceImages: ["a", "", "b"],
      externalUrls: [" https://example.com ", "", "https://foo.bar"],
    });

    expect(input.scope).toBe("full");
    expect(input.creativityLevel).toBe("balanced");
    expect(input.intentionality).toBe(false);
    expect(input.referenceImages).toEqual(["a", "b"]);
    expect(input.externalUrls).toEqual(["https://example.com", "https://foo.bar"]);
  });

  it("rejects missing required fields", () => {
    expect(() => parseGenerateInput({ brandName: "", industry: "" })).toThrow(
      "brandName e industry são obrigatórios."
    );
  });

  it("extracts JSON objects from wrapped text", () => {
    expect(safeParseJson("```json\n{\"ok\":true}\n```"))
      .toEqual({ ok: true });
  });
});
