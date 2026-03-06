import { beforeEach, describe, expect, it, vi } from "vitest";

const { rasterFileToOptimizedDataUrlMock } = vi.hoisted(() => ({
  rasterFileToOptimizedDataUrlMock: vi.fn(),
}));

vi.mock("@/lib/imageDataUrl", () => ({
  rasterFileToOptimizedDataUrl: rasterFileToOptimizedDataUrlMock,
}));

import { prepareLogoUpload } from "./generateBriefingFormLogo";

describe("generateBriefingFormLogo", () => {
  beforeEach(() => {
    rasterFileToOptimizedDataUrlMock.mockReset();
  });

  it("rejects non-image files", async () => {
    const file = new File(["hello"], "brief.txt", { type: "text/plain" });

    await expect(prepareLogoUpload(file)).resolves.toEqual({
      error: "Envie um arquivo de imagem (PNG, SVG, JPG, etc).",
    });
  });

  it("rejects files larger than 12MB", async () => {
    const file = {
      type: "image/png",
      size: 12 * 1024 * 1024 + 1,
      name: "logo.png",
    } as File;

    await expect(prepareLogoUpload(file)).resolves.toEqual({
      error: "Arquivo muito grande. Tente um logo menor (máx. 12MB).",
    });
  });

  it("returns a logo asset when processing succeeds", async () => {
    rasterFileToOptimizedDataUrlMock.mockResolvedValue("data:image/webp;base64,abc");
    const file = new File(["img"], "logo.png", { type: "image/png" });

    const result = await prepareLogoUpload(file);

    expect(result).toEqual({
      logoImage: expect.objectContaining({
        name: "logo.png",
        dataUrl: "data:image/webp;base64,abc",
        type: "logo",
      }),
    });
  });

  it("returns an error when the optimized logo is too large", async () => {
    rasterFileToOptimizedDataUrlMock.mockResolvedValue("x".repeat(3_500_001));
    const file = new File(["img"], "logo.png", { type: "image/png" });

    await expect(prepareLogoUpload(file)).resolves.toEqual({
      error: "Logo muito pesado para enviar. Tente uma versão menor ou em PNG/SVG simplificado.",
    });
  });

  it("returns an error when processing throws", async () => {
    rasterFileToOptimizedDataUrlMock.mockRejectedValue(new Error("boom"));
    const file = new File(["img"], "logo.png", { type: "image/png" });

    await expect(prepareLogoUpload(file)).resolves.toEqual({
      error: "Falha ao processar o logo. Tente PNG/JPG.",
    });
  });
});
