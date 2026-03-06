import { describe, expect, it } from "vitest";
import { readJsonResponse } from "./http";

describe("readJsonResponse", () => {
  it("parses valid JSON payloads", async () => {
    const res = new Response(JSON.stringify({ ok: true, value: 42 }));

    await expect(readJsonResponse<{ ok: boolean; value: number }>(res, "/api/test")).resolves.toEqual({
      ok: true,
      value: 42,
    });
  });

  it("returns an empty object for empty bodies", async () => {
    const res = new Response("");

    await expect(readJsonResponse<Record<string, never>>(res, "/api/test")).resolves.toEqual({});
  });

  it("throws a markup-specific error when the API returns HTML", async () => {
    const res = new Response("<html><body>invalid</body></html>");

    await expect(readJsonResponse(res, "/api/test")).rejects.toThrow(
      "/api/test retornou XML/HTML em vez de JSON."
    );
  });
});
