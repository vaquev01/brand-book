import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchImageDataUrl } from "./imageTransport";

describe("fetchImageDataUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the proxied data URL when the API succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ dataUrl: "data:image/png;base64,abc" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(fetchImageDataUrl("https://example.com/image.png")).resolves.toBe(
      "data:image/png;base64,abc"
    );
  });

  it("surfaces a parsing error when the proxy returns markup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>denied</html>", { status: 502 }))
    );

    await expect(fetchImageDataUrl("https://example.com/image.png")).rejects.toThrow(
      "/api/image-to-dataurl retornou XML/HTML em vez de JSON."
    );
  });
});
