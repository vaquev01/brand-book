import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { ASSET_CATALOG } from "@/lib/imagePrompts";
import { bytesToBase64, fnv1a32, isPrivateHostname } from "@/lib/common";

export type AspectRatioKey = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";

export type GenerateImageInput = {
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

export type GenerateImageResult = {
  aspectRatio: AspectRatioKey;
  provider: "dalle3" | "stability" | "ideogram" | "imagen";
  size?: string;
  url: string;
  fallback?: boolean;
};

export class GenerateImageInputError extends Error {}

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
  ASSET_CATALOG.map((asset) => [asset.key, asset.aspectRatio as AspectRatioKey])
) as Record<string, AspectRatioKey>;

const STRICT_LOGO_ASSETS = new Set([
  "logo_dark_bg",
  "business_card",
  "brand_collateral",
  "delivery_packaging",
  "takeaway_bag",
  "food_container",
  "uniform_tshirt",
  "uniform_apron",
  "outdoor_billboard",
]);

function isStabilitySdxlEngine(engineId: string): boolean {
  const lower = engineId.toLowerCase();
  return lower.includes("sdxl") || lower.includes("xl");
}

function pickStabilitySize(engineId: string, ratio: AspectRatioKey): { width: number; height: number } {
  return isStabilitySdxlEngine(engineId) ? STABILITY_SIZES[ratio] : STABILITY_SIZES_512[ratio];
}

export function pickGenerateImageAspectRatio(assetKey?: string, aspectRatio?: AspectRatioKey): AspectRatioKey {
  if (aspectRatio && IMAGEN_RATIOS[aspectRatio]) return aspectRatio;
  if (assetKey && ASSET_ASPECT_RATIOS[assetKey]) return ASSET_ASPECT_RATIOS[assetKey];
  return "1:1";
}

function isStrictLogoAsset(assetKey?: string): boolean {
  return !!assetKey && STRICT_LOGO_ASSETS.has(assetKey);
}

export function shouldUseGoogleGenerateContentModel(
  selectedModel: string,
  assetKey?: string,
  hasReferenceImages = false
): boolean {
  if (hasReferenceImages) return true;
  if (!selectedModel.toLowerCase().startsWith("gemini")) return false;
  return assetKey !== "logo_primary";
}

export function extractNegativePrompt(prompt: string): { positive: string; negative: string } {
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
    const match = trimmed.match(re);
    if (!match) continue;
    const idx = trimmed.toLowerCase().lastIndexOf(`\n\n${normalizePrefix.toLowerCase()}`);
    if (idx === -1) continue;
    const negative = (match[1] ?? "").trim().replace(/\.*\s*$/, "");
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
    return {
      positive: positiveRaw,
      negative: negativeRaw.replace(/\.*\s*$/, "").trim() || fallback,
    };
  }

  return { positive: trimmed, negative: fallback };
}

async function generateImagenDataUrl(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const response = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      outputMimeType: "image/png",
    },
  });
  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) throw new Error("Imagen não retornou imagem");
  return `data:image/png;base64,${bytesToBase64(imageBytes)}`;
}

async function generateImagenWithFallback(
  ai: GoogleGenAI,
  models: string[],
  prompt: string,
  aspectRatio: string
): Promise<string> {
  let lastError: unknown;
  for (const model of models) {
    try {
      return await generateImagenDataUrl(ai, model, prompt, aspectRatio);
    } catch (error: unknown) {
      lastError = error;
    }
  }
  throw new Error(lastError instanceof Error ? lastError.message : "Erro ao gerar imagem");
}

function extractVisualSystemSeed(prompt: string, assetKey?: string): number | null {
  const match = prompt.match(/VISUAL_SYSTEM_ID:\s*BBVS-([0-9a-f]{8})/i);
  if (!match) return null;
  const base = Number.parseInt(match[1], 16);
  const tweak = assetKey ? fnv1a32(assetKey) : 0;
  const seed = ((base ^ tweak) >>> 0) % 2147483647;
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

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return null;
  }

  if (isPrivateHostname((parsedUrl.hostname || "").toLowerCase())) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(trimmed, { signal: controller.signal, redirect: "manual" });
    if (response.status >= 300 && response.status < 400) return null;
    if (!response.ok) return null;

    const len = Number(response.headers.get("content-length") || "0");
    if (Number.isFinite(len) && len > 6_000_000) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 6_000_000) return null;
    const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    if (!mimeType.startsWith("image/")) return null;

    return {
      inlineData: {
        mimeType,
        data: bytesToBase64(new Uint8Array(buffer)),
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateImageWithProvider(input: GenerateImageInput): Promise<GenerateImageResult> {
  const {
    prompt,
    provider,
    assetKey,
    aspectRatio,
    openaiKey,
    stabilityKey,
    ideogramKey,
    googleKey,
    openaiImageModel,
    stabilityModel,
    ideogramModel,
    googleImageModel,
    referenceImages,
  } = input;

  const pickedAspectRatio = pickGenerateImageAspectRatio(assetKey, aspectRatio);
  const strictLogo = isStrictLogoAsset(assetKey);

  switch (provider) {
    case "dalle3": {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho.");

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
      return { url, provider: "dalle3", size, aspectRatio: pickedAspectRatio };
    }

    case "stability": {
      const apiKey = stabilityKey?.trim() || process.env.STABILITY_API_KEY;
      if (!apiKey) throw new Error("STABILITY_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho.");

      const { positive, negative } = extractNegativePrompt(prompt);
      const seed = extractVisualSystemSeed(prompt, assetKey);
      const resolvedModel = stabilityModel?.trim() || "stable-diffusion-xl-1024-v1-0";
      const { width, height } = pickStabilitySize(resolvedModel, pickedAspectRatio);

      const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
      const isPattern = assetKey === "brand_pattern";
      const isMascot = assetKey === "brand_mascot";
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
      const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(assetKey ?? "");
      const isHero = assetKey === "hero_visual" || assetKey === "hero_lifestyle";

      const stylePreset = isLogo
        ? "digital-art"
        : isPattern
          ? "tile-texture"
          : isMascot
            ? "digital-art"
            : isMockup
              ? "photographic"
              : isHero
                ? "cinematic"
                : isSocial
                  ? "digital-art"
                  : "cinematic";

      const cfgScale = isLogo ? 11 : isPattern ? 9 : isMascot ? 8 : isMockup ? 7 : isHero ? 7 : 8;
      const sampler = isLogo || isPattern || isMascot ? "K_EULER" : "K_DPMPP_2M";
      const steps = isLogo ? 60 : 50;

      const response = await fetch(`https://api.stability.ai/v1/generation/${resolvedModel}/text-to-image`, {
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
          cfg_scale: cfgScale,
          height,
          width,
          steps,
          samples: 1,
          style_preset: stylePreset,
          seed: seed ?? 0,
          sampler,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string; name?: string; errors?: string[] };
        throw new Error(error.message ?? error.name ?? `Stability AI erro ${response.status}`);
      }

      const data = (await response.json()) as { artifacts?: { base64: string; finishReason: string }[] };
      const base64 = data.artifacts?.[0]?.base64;
      if (!base64) throw new Error("Stability AI não retornou dados de imagem");

      return {
        url: `data:image/png;base64,${base64}`,
        provider: "stability",
        size: `${width}x${height}`,
        aspectRatio: pickedAspectRatio,
      };
    }

    case "ideogram": {
      const apiKey = ideogramKey?.trim() || process.env.IDEOGRAM_API_KEY;
      if (!apiKey) throw new Error("IDEOGRAM_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho.");

      const { positive, negative } = extractNegativePrompt(prompt);
      const finalPrompt = `${positive.slice(0, 1750)}\n\nAvoid: ${negative.slice(0, 700)}.`;
      const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
      const isDesign = ["brand_pattern", "brand_mascot", "social_cover", "social_post_square", "email_header", "instagram_carousel", "instagram_story", "youtube_thumbnail", "presentation_bg"].includes(assetKey ?? "");
      const isPhoto = ["hero_lifestyle", "business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board", "outdoor_billboard", "app_mockup"].includes(assetKey ?? "");

      const response = await fetch("https://api.ideogram.ai/generate", {
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
            magic_prompt_option: isLogo || isDesign ? "OFF" : "AUTO",
            style_type: isLogo ? "DESIGN" : isDesign ? "DESIGN" : isPhoto ? "REALISTIC" : "AUTO",
          },
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(error.error ?? error.message ?? `Ideogram erro ${response.status}`);
      }

      const data = (await response.json()) as { data?: { url: string }[] };
      const url = data.data?.[0]?.url;
      if (!url) throw new Error("Ideogram não retornou URL de imagem");
      return { url, provider: "ideogram", aspectRatio: pickedAspectRatio };
    }

    case "imagen": {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho.");

      const ai = new GoogleGenAI({ apiKey });
      const { positive, negative } = extractNegativePrompt(prompt);
      const rawModel = googleImageModel?.trim();
      const selectedModel = (rawModel?.startsWith("models/") ? rawModel.slice("models/".length) : rawModel) || "imagen-3.0-generate-002";
      const selectedLower = selectedModel.toLowerCase();
      const hasRefImages = Array.isArray(referenceImages) && referenceImages.length > 0;

      if (strictLogo && !hasRefImages) {
        throw new GenerateImageInputError(
          "Para garantir consistência do logo, esta peça exige uma imagem de referência do logo (gere primeiro o Logo — Fundo Claro ou faça upload em Assets)."
        );
      }

      const shouldUseGemini = shouldUseGoogleGenerateContentModel(selectedModel, assetKey, hasRefImages);
      const geminiModel = selectedLower.startsWith("gemini") ? selectedModel : "gemini-3.1-flash-image-preview";

      if (shouldUseGemini) {
        const ratioHints: Record<AspectRatioKey, string> = {
          "1:1": "square 1:1 aspect ratio",
          "16:9": "wide landscape 16:9 aspect ratio",
          "9:16": "tall portrait 9:16 aspect ratio",
          "4:3": "standard 4:3 landscape aspect ratio",
          "21:9": "ultra-wide cinematic 21:9 aspect ratio",
        };
        const isMascotAsset = assetKey === "brand_mascot";
        const isLogoAsset = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const isApplicationAsset = assetKey?.startsWith("app_");
        const refAnchor = hasRefImages
          ? [
              "REFERENCE IMAGES PROVIDED:",
              isLogoAsset
                ? "- You are generating a corporate LOGO. Treat the attached images ONLY as structural or geometric inspiration. IGNORE their photographic or illustrative style completely. Force the output to be a flat 2D vector graphic."
                : isApplicationAsset
                ? "- CRITICAL: The reference image shows EXACTLY what the user wants to create. Replicate the same SUBJECT (product, object, item type) from the reference. Apply the brand identity (colors, logo, patterns) to that exact type of object. Do NOT substitute it with a different product or item."
                : "- Treat all attached images as hard style anchors (brand system, motifs, line weights, textures, lighting).",
              "- If any attached image contains a logo/wordmark/symbol, do NOT redesign it. Replicate the same logo exactly.",
              isApplicationAsset
                ? "- Match the reference's: product type, shape, proportions, materials, camera angle, and styling. Change ONLY the branding to match the brand system."
                : isMascotAsset
                ? "- You ARE generating a mascot. Derive the mascot style from the references and the STYLE_TREE. Do not introduce unrelated motifs."
                : "- Do not introduce new symbols, mascots, or unrelated motifs beyond what is present/derivable from the references and the STYLE_TREE.",
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
          const response = await ai.models.generateContent({
            model: geminiModel,
            contents,
            config: { responseModalities: ["IMAGE", "TEXT"] },
          });
          const parts = response.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType ?? "image/png";
              return {
                url: `data:${mimeType};base64,${part.inlineData.data}`,
                provider: "imagen",
                aspectRatio: pickedAspectRatio,
              };
            }
          }
          throw new Error("Gemini não retornou imagem.");
        } catch {
          if (strictLogo && hasRefImages) {
            throw new Error("Falha ao gerar com referências (Gemini). Para manter consistência do logo, não foi feito fallback.");
          }
          const finalPrompt = `${positive.slice(0, 1600)}\n\nDo not include: ${negative.slice(0, 800)}.`.slice(0, 2000);
          const url = await generateImagenWithFallback(
            ai,
            ["imagen-3.0-generate-002", "imagen-3.0-generate-001"],
            finalPrompt,
            IMAGEN_RATIOS[pickedAspectRatio]
          );
          return { url, provider: "imagen", aspectRatio: pickedAspectRatio, fallback: true };
        }
      }

      const finalPrompt = `${positive.slice(0, 1600)}\n\nDo not include: ${negative.slice(0, 800)}.`.slice(0, 2000);
      const url = await generateImagenWithFallback(
        ai,
        [selectedModel, "imagen-3.0-generate-002", "imagen-3.0-generate-001"].filter(Boolean),
        finalPrompt,
        IMAGEN_RATIOS[pickedAspectRatio]
      );
      return { url, provider: "imagen", aspectRatio: pickedAspectRatio };
    }

    default:
      throw new GenerateImageInputError("Provider inválido. Use: dalle3 | stability | ideogram | imagen");
  }
}
