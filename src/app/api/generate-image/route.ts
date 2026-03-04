import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { ASSET_CATALOG } from "@/lib/imagePrompts";

export const runtime = "nodejs";

type AspectRatioKey = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";

const DALLE3_SIZES: Record<AspectRatioKey, "1024x1024" | "1792x1024" | "1024x1792"> = {
  "1:1": "1024x1024",
  "16:9": "1792x1024",
  "9:16": "1024x1792",
  "4:3": "1792x1024",
  "21:9": "1792x1024",
};

const STABILITY_SIZES: Record<AspectRatioKey, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "21:9": { width: 1536, height: 640 },
};

const STABILITY_SIZES_512: Record<AspectRatioKey, { width: number; height: number }> = {
  "1:1": { width: 512, height: 512 },
  "16:9": { width: 640, height: 384 },
  "9:16": { width: 384, height: 640 },
  "4:3": { width: 640, height: 512 },
  "21:9": { width: 768, height: 320 },
};

function isStabilitySdxlEngine(engineId: string): boolean {
  const e = engineId.toLowerCase();
  return e.includes("sdxl") || e.includes("xl");
}

function pickStabilitySize(engineId: string, ratio: AspectRatioKey): { width: number; height: number } {
  return isStabilitySdxlEngine(engineId) ? STABILITY_SIZES[ratio] : STABILITY_SIZES_512[ratio];
}

const IMAGEN_RATIOS: Record<AspectRatioKey, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
  "21:9": "16:9",
};

const IDEOGRAM_RATIOS: Record<AspectRatioKey, string> = {
  "1:1": "ASPECT_1_1",
  "16:9": "ASPECT_16_9",
  "9:16": "ASPECT_9_16",
  "4:3": "ASPECT_4_3",
  "21:9": "ASPECT_16_9",
};

const ASSET_ASPECT_RATIOS: Record<string, AspectRatioKey> = Object.fromEntries(
  ASSET_CATALOG.map((a) => [a.key, a.aspectRatio as AspectRatioKey])
) as Record<string, AspectRatioKey>;

function extractNegativePrompt(prompt: string): { positive: string; negative: string } {
  const trimmed = prompt.trim();
  const fallback = "blurry, low quality, watermark, deformed, ugly";

  const negIdx = trimmed.indexOf(" --neg ");
  if (negIdx !== -1) {
    return {
      positive: trimmed.slice(0, negIdx).trim(),
      negative: trimmed.slice(negIdx + 7).trim() || fallback,
    };
  }

  const patterns: Array<{ re: RegExp; normalizePrefix: string }> = [
    { re: /\n\nNEGATIVE:\s*([\s\S]+)$/i, normalizePrefix: "NEGATIVE:" },
    { re: /\n\nDo not include, do not generate:\s*([\s\S]+)$/i, normalizePrefix: "Do not include, do not generate:" },
    { re: /\n\nDo not include:\s*([\s\S]+)$/i, normalizePrefix: "Do not include:" },
    { re: /\n\nAvoid including:\s*([\s\S]+)$/i, normalizePrefix: "Avoid including:" },
    { re: /\n\nAvoid:\s*([\s\S]+)$/i, normalizePrefix: "Avoid:" },
  ];

  for (const { re, normalizePrefix } of patterns) {
    const m = trimmed.match(re);
    if (!m) continue;
    const idx = trimmed.toLowerCase().lastIndexOf(`\n\n${normalizePrefix.toLowerCase()}`);
    if (idx === -1) continue;
    const negative = (m[1] ?? "").trim().replace(/\.*\s*$/, "");
    return {
      positive: trimmed.slice(0, idx).trim(),
      negative: negative || fallback,
    };
  }

  const lower = trimmed.toLowerCase();
  const markers = [
    "negative:",
    "do not include, do not generate:",
    "do not include:",
    "avoid including:",
    "avoid:",
  ];

  for (const marker of markers) {
    const idx = lower.lastIndexOf(marker);
    if (idx === -1) continue;
    const negativeRaw = trimmed.slice(idx + marker.length).trim();
    const positiveRaw = trimmed.slice(0, idx).trim();
    if (!positiveRaw) continue;
    const negative = negativeRaw.replace(/\.*\s*$/, "").trim();
    return {
      positive: positiveRaw,
      negative: negative || fallback,
    };
  }

  return { positive: trimmed, negative: fallback };
}

function bytesToBase64(bytes: unknown): string {
  if (typeof bytes === "string") return bytes;
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  if (bytes instanceof Uint8Array) {
    if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
    if (typeof btoa !== "undefined") {
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return btoa(binary);
    }
  }
  throw new Error("Não foi possível converter bytes da imagem para base64");
}

async function generateImagenDataUrl(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const resp = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      outputMimeType: "image/png",
    },
  });
  const imageBytes = resp.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) throw new Error("Imagen não retornou imagem");
  const b64 = bytesToBase64(imageBytes);
  return `data:image/png;base64,${b64}`;
}

async function generateImagenWithFallback(
  ai: GoogleGenAI,
  models: string[],
  prompt: string,
  aspectRatio: string
): Promise<string> {
  let lastErr: unknown;
  for (const m of models) {
    try {
      return await generateImagenDataUrl(ai, m, prompt, aspectRatio);
    } catch (e: unknown) {
      lastErr = e;
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : "Erro ao gerar imagem";
  throw new Error(msg);
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function extractVisualSystemSeed(prompt: string, assetKey?: string): number | null {
  const m = prompt.match(/VISUAL_SYSTEM_ID:\s*BBVS-([0-9a-f]{8})/i);
  if (!m) return null;
  const base = Number.parseInt(m[1], 16);
  const tweak = assetKey ? fnv1a32(assetKey) : 0;
  const combined = (base ^ tweak) >>> 0;
  const seed = combined % 2147483647;
  return seed > 0 ? seed : 1;
}

async function refToInlineData(ref: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  const trimmed = ref.trim();
  if (!trimmed) return null;

  const dataUrlMatch = trimmed.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return { inlineData: { mimeType: dataUrlMatch[1], data: dataUrlMatch[2] } };
  }

  if (!/^https?:\/\//i.test(trimmed)) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = (url.hostname || "").toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.startsWith("169.254.");
  if (isPrivate) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(trimmed, { signal: controller.signal, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) return null;
    if (!res.ok) return null;

    const len = Number(res.headers.get("content-length") || "0");
    if (Number.isFinite(len) && len > 6_000_000) return null;

    const buf = await res.arrayBuffer();
    if (buf.byteLength > 6_000_000) return null;
    const mimeType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    if (!mimeType.startsWith("image/")) return null;
    return { inlineData: { mimeType, data: bytesToBase64(new Uint8Array(buf)) } };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, assetKey, openaiKey, stabilityKey, ideogramKey, googleKey,
      openaiImageModel, stabilityModel, ideogramModel, googleImageModel, referenceImages, aspectRatio } = await request.json() as {
      prompt: string;
      provider: string;
      assetKey?: string;
      aspectRatio?: AspectRatioKey;
      openaiKey?: string;
      stabilityKey?: string;
      ideogramKey?: string;
      googleKey?: string;
      openaiImageModel?: string;
      stabilityModel?: string;
      ideogramModel?: string;
      googleImageModel?: string;
      referenceImages?: string[];
    };

    if (!prompt || !provider) {
      return NextResponse.json({ error: "prompt e provider são obrigatórios" }, { status: 400 });
    }

    const pickedAspectRatio: AspectRatioKey = (aspectRatio && IMAGEN_RATIOS[aspectRatio])
      ? aspectRatio
      : (assetKey && ASSET_ASPECT_RATIOS[assetKey])
        ? ASSET_ASPECT_RATIOS[assetKey]
        : "1:1";

    switch (provider) {
      case "dalle3": {
        const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "OPENAI_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const openai = new OpenAI({ apiKey });
        const size = DALLE3_SIZES[pickedAspectRatio];
        const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const isPhoto = [
          "hero_lifestyle",
          "app_mockup",
          "business_card",
          "brand_collateral",
          "delivery_packaging",
          "takeaway_bag",
          "food_container",
          "uniform_tshirt",
          "uniform_apron",
          "materials_board",
          "outdoor_billboard",
        ].includes(assetKey ?? "");
        const style: "natural" | "vivid" = isLogo || isPhoto ? "natural" : "vivid";
        const { positive, negative } = extractNegativePrompt(prompt);
        const finalPrompt = `${positive.slice(0, 3300)}\n\nDo not include: ${negative.slice(0, 700)}.`.slice(0, 4000);
        const response = await openai.images.generate({
          model: openaiImageModel?.trim() || "dall-e-3",
          prompt: finalPrompt,
          n: 1,
          size,
          quality: "hd",
          style,
        });
        const url = response.data?.[0]?.url;
        if (!url) throw new Error("DALL-E 3 não retornou URL de imagem");
        return NextResponse.json({ url, provider: "dalle3", size, aspectRatio: pickedAspectRatio });
      }

      case "stability": {
        const apiKey = stabilityKey?.trim() || process.env.STABILITY_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "STABILITY_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const { positive, negative } = extractNegativePrompt(prompt);
        const seed = extractVisualSystemSeed(prompt, assetKey);

        const resolvedStabilityModel = stabilityModel?.trim() || "stable-diffusion-xl-1024-v1-0";
        const { width, height } = pickStabilitySize(resolvedStabilityModel, pickedAspectRatio);

        const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const isPattern = assetKey === "brand_pattern";
        const isMockup = [
          "business_card",
          "brand_collateral",
          "app_mockup",
          "outdoor_billboard",
          "delivery_packaging",
          "takeaway_bag",
          "food_container",
          "uniform_tshirt",
          "uniform_apron",
          "materials_board",
        ].includes(assetKey ?? "");

        const stylePreset = isLogo ? "digital-art"
          : isPattern ? "tile-texture"
          : isMockup ? "photographic"
          : "cinematic";

        const res = await fetch(
          `https://api.stability.ai/v1/generation/${resolvedStabilityModel}/text-to-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              text_prompts: [
                { text: positive.slice(0, 2000), weight: 1 },
                { text: negative.slice(0, 1000), weight: -1 },
              ],
              cfg_scale: isLogo ? 10 : 8,
              height,
              width,
              steps: 50,
              samples: 1,
              style_preset: stylePreset,
              seed: seed ?? 0,
              sampler: "K_DPMPP_2M",
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { message?: string; name?: string; errors?: string[] };
          throw new Error(err.message ?? err.name ?? `Stability AI erro ${res.status}`);
        }
        const sdData = await res.json() as { artifacts?: { base64: string; finishReason: string }[] };
        const base64 = sdData.artifacts?.[0]?.base64;
        if (!base64) throw new Error("Stability AI não retornou dados de imagem");
        return NextResponse.json({
          url: `data:image/png;base64,${base64}`,
          provider: "stability",
          size: `${width}x${height}`,
          aspectRatio: pickedAspectRatio,
        });
      }

      case "ideogram": {
        const apiKey = ideogramKey?.trim() || process.env.IDEOGRAM_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "IDEOGRAM_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const { positive, negative } = extractNegativePrompt(prompt);
        const finalPrompt = `${positive.slice(0, 1750)}\n\nAvoid: ${negative.slice(0, 700)}.`;
        const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const isDesign = ["brand_pattern", "social_cover", "social_post_square", "email_header"].includes(assetKey ?? "");

        const res = await fetch("https://api.ideogram.ai/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": apiKey,
          },
          body: JSON.stringify({
            image_request: {
              prompt: finalPrompt.slice(0, 2000),
              model: ideogramModel?.trim() || "V_2",
              aspect_ratio: IDEOGRAM_RATIOS[pickedAspectRatio],
              magic_prompt_option: "OFF",
              style_type: isLogo ? "DESIGN" : isDesign ? "DESIGN" : "REALISTIC",
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string; message?: string };
          throw new Error(err.error ?? err.message ?? `Ideogram erro ${res.status}`);
        }
        const ideogramData = await res.json() as { data?: { url: string }[] };
        const url = ideogramData.data?.[0]?.url;
        if (!url) throw new Error("Ideogram não retornou URL de imagem");
        return NextResponse.json({ url, provider: "ideogram", aspectRatio: pickedAspectRatio });
      }

      case "imagen": {
        const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "GOOGLE_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const ai = new GoogleGenAI({ apiKey });
        const { positive, negative } = extractNegativePrompt(prompt);
        const rawModel = googleImageModel?.trim();
        const model = (rawModel?.startsWith("models/") ? rawModel.slice("models/".length) : rawModel)
          || "gemini-3.1-flash-image-preview";
        const modelLower = model.toLowerCase();

        if (modelLower.startsWith("gemini")) {
          const ratioHints: Record<AspectRatioKey, string> = {
            "1:1": "square 1:1 aspect ratio",
            "16:9": "wide landscape 16:9 aspect ratio",
            "9:16": "tall portrait 9:16 aspect ratio",
            "4:3": "standard 4:3 landscape aspect ratio",
            "21:9": "ultra-wide cinematic 21:9 aspect ratio",
          };
          const hasRefImages = Array.isArray(referenceImages) && referenceImages.length > 0;
          const refAnchor = hasRefImages
            ? [
              "REFERENCE IMAGES PROVIDED (STRICT):",
              "- Treat all attached images as hard style anchors (brand system, motifs, line weights, textures, lighting).",
              "- If any attached image contains a logo/wordmark/symbol, do NOT redesign it. Replicate the same logo exactly.",
              "- Do not introduce new symbols, mascots, or unrelated motifs beyond what is present/derivable from the references and the STYLE_TREE.",
              "- Keep one coherent visual system across outputs (same art direction).",
            ].join("\n")
            : "";

          const fullPrompt = `${positive.slice(0, 2400)}\n\n${refAnchor}\n\nGenerate as ${ratioHints[pickedAspectRatio]} image.\n\nDo not include: ${negative.slice(0, 1000)}.`;
          const contentParts: unknown[] = [{ text: fullPrompt }];
          if (hasRefImages) {
            for (const ref of referenceImages!) {
              const inline = await refToInlineData(ref);
              if (inline) contentParts.push(inline);
            }
          }

          const contents = hasRefImages
            ? (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"])
            : fullPrompt;

          try {
            const resp = await ai.models.generateContent({
              model,
              contents,
              config: { responseModalities: ["IMAGE", "TEXT"] },
            });
            const parts = resp.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType ?? "image/png";
                return NextResponse.json({
                  url: `data:${mimeType};base64,${part.inlineData.data}`,
                  provider: "imagen",
                  aspectRatio: pickedAspectRatio,
                });
              }
            }
            throw new Error("Gemini não retornou imagem.");
          } catch {
            const imagenRatio = IMAGEN_RATIOS[pickedAspectRatio];
            const finalPrompt = `${positive.slice(0, 1600)}\n\nDo not include: ${negative.slice(0, 800)}.`.slice(0, 2000);
            const url = await generateImagenWithFallback(
              ai,
              ["imagen-3.0-generate-002", "imagen-3.0-fast-generate-001"],
              finalPrompt,
              imagenRatio
            );
            return NextResponse.json({ url, provider: "imagen", aspectRatio: pickedAspectRatio });
          }
        }

        const imagenRatio = IMAGEN_RATIOS[pickedAspectRatio];
        const finalPrompt = `${positive.slice(0, 1600)}\n\nDo not include: ${negative.slice(0, 800)}.`.slice(0, 2000);
        const url = await generateImagenWithFallback(
          ai,
          [model, "imagen-3.0-generate-002", "imagen-3.0-fast-generate-001"].filter(Boolean),
          finalPrompt,
          imagenRatio
        );
        return NextResponse.json({ url, provider: "imagen", aspectRatio: pickedAspectRatio });
      }

      default:
        return NextResponse.json(
          { error: "Provider inválido. Use: dalle3 | stability | ideogram | imagen" },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("[generate-image]", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
