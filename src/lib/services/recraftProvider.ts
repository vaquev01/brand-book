/**
 * Recraft V4 Provider — generates true SVG vector images + high-quality raster.
 * API: https://external.api.recraft.ai/v1
 * The ONLY production-grade API that outputs native SVG paths.
 */

import { bytesToBase64 } from "@/lib/common";

export type RecraftStyle =
  | "realistic_image"
  | "digital_illustration"
  | "vector_illustration"
  | "icon";

export type RecraftSubstyle =
  | "flat_2"
  | "hand_drawn"
  | "stamp"
  | "engraving"
  | "line_art"
  | "line_circuit"
  | "linocut";

export type RecraftOutputFormat = "svg" | "png" | "webp";

export interface RecraftGenerateInput {
  prompt: string;
  style?: RecraftStyle;
  substyle?: RecraftSubstyle;
  model?: string;
  size?: string;
  outputFormat?: RecraftOutputFormat;
  apiKey: string;
  colors?: Array<{ rgb: [number, number, number] }>;
}

export interface RecraftGenerateResult {
  url: string;
  isSvg: boolean;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

export function brandColorsToRecraft(hexColors: string[]): Array<{ rgb: [number, number, number] }> {
  return hexColors
    .map(hexToRgb)
    .filter((c): c is [number, number, number] => c !== null)
    .slice(0, 5)
    .map((rgb) => ({ rgb }));
}

/**
 * Generate an image via Recraft V4 API.
 * Returns a URL (for raster) or a data URL (for SVG).
 */
export async function generateWithRecraft(input: RecraftGenerateInput): Promise<RecraftGenerateResult> {
  const {
    prompt,
    style = "vector_illustration",
    substyle = "flat_2",
    model = "recraftv3",
    size = "1024x1024",
    outputFormat = "svg",
    apiKey,
    colors,
  } = input;

  const body: Record<string, unknown> = {
    prompt,
    style,
    substyle,
    model,
    size,
    response_format: "url",
  };

  if (colors && colors.length > 0) {
    body.colors = colors;
  }

  const response = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(error.error?.message ?? `Recraft API error ${response.status}`);
  }

  const data = (await response.json()) as { data?: Array<{ url: string }> };
  const url = data.data?.[0]?.url;
  if (!url) throw new Error("Recraft não retornou URL de imagem");

  // For SVG format, fetch the content and return as data URL
  if (outputFormat === "svg") {
    const svgRes = await fetch(url);
    if (!svgRes.ok) throw new Error("Falha ao baixar SVG do Recraft");
    const svgText = await svgRes.text();
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgText).toString("base64")}`;
    return { url: svgDataUrl, isSvg: true };
  }

  return { url, isSvg: false };
}

/** Size map for Recraft — supports specific sizes */
export const RECRAFT_SIZES: Record<string, string> = {
  "1:1": "1024x1024",
  "16:9": "1365x1024",
  "9:16": "1024x1365",
  "4:3": "1365x1024",
  "21:9": "1536x640",
};

/**
 * Generate a brand icon via Recraft V4 — native SVG output.
 * This produces REAL vector paths, not traced rasters.
 */
export async function generateBrandIcon(input: {
  prompt: string;
  apiKey: string;
  colors?: Array<{ rgb: [number, number, number] }>;
  substyle?: RecraftSubstyle;
}): Promise<string> {
  const result = await generateWithRecraft({
    prompt: input.prompt,
    style: "icon",
    substyle: input.substyle ?? "flat_2",
    model: "recraftv3",
    size: "1024x1024",
    outputFormat: "svg",
    apiKey: input.apiKey,
    colors: input.colors,
  });
  return result.url;
}

/**
 * Generate a brand pattern/texture via Recraft V4.
 * Uses vector_illustration style for clean, tileable results.
 */
export async function generateBrandPattern(input: {
  prompt: string;
  apiKey: string;
  colors?: Array<{ rgb: [number, number, number] }>;
  size?: string;
}): Promise<RecraftGenerateResult> {
  return generateWithRecraft({
    prompt: input.prompt,
    style: "vector_illustration",
    substyle: "flat_2",
    model: "recraftv3",
    size: input.size ?? "1024x1024",
    outputFormat: "png",
    apiKey: input.apiKey,
    colors: input.colors,
  });
}
