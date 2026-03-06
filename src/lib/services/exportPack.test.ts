import { describe, expect, it } from "vitest";
import { saasExample } from "@/lib/examples";
import { decodeDataUrl, parseExportPackInput, safeRelPath } from "./exportPack";

describe("exportPack service", () => {
  it("normalizes only safe relative paths", () => {
    expect(safeRelPath("tokens/colors.json")).toBe("tokens/colors.json");
    expect(safeRelPath("..\/secret.txt")).toBeNull();
    expect(safeRelPath("/absolute/file.txt")).toBeNull();
  });

  it("decodes data URLs into bytes and extension", () => {
    const decoded = decodeDataUrl("data:image/png;base64,SGVsbG8=");
    expect(decoded?.ext).toBe("png");
    expect(Array.from(decoded?.bytes ?? [])).toEqual([72, 101, 108, 108, 111]);
  });

  it("validates and normalizes the export payload", () => {
    const payload = parseExportPackInput({
      brandbookData: saasExample,
      generatedAssets: [],
      uploadedAssets: [],
      assetPackFiles: [],
    });

    expect(payload.brandbookData.brandName).toBe(saasExample.brandName);
    expect(payload.generatedAssets).toEqual([]);
    expect(payload.uploadedAssets).toEqual([]);
    expect(payload.assetPackFiles).toEqual([]);
  });
});
