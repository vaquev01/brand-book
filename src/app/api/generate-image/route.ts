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
  const negIdx = prompt.indexOf(" --neg ");
  if (negIdx === -1) return { positive: prompt, negative: "blurry, low quality, watermark, deformed, ugly" };
  return {
    positive: prompt.slice(0, negIdx).trim(),
    negative: prompt.slice(negIdx + 7).trim(),
  };
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

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, assetKey, openaiKey, stabilityKey, ideogramKey, googleKey,
      openaiImageModel, stabilityModel, ideogramModel, googleImageModel, referenceImages } = await request.json() as {
      prompt: string;
      provider: string;
      assetKey?: string;
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

    const aspectRatio: AspectRatioKey = (assetKey && ASSET_ASPECT_RATIOS[assetKey]) ? ASSET_ASPECT_RATIOS[assetKey] : "1:1";

    switch (provider) {
      case "dalle3": {
        const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "OPENAI_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const openai = new OpenAI({ apiKey });
        const size = DALLE3_SIZES[aspectRatio];
        const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const response = await openai.images.generate({
          model: openaiImageModel?.trim() || "dall-e-3",
          prompt: prompt.replace(" --neg ", ". Avoid: ").slice(0, 4000),
          n: 1,
          size,
          quality: "hd",
          style: isLogo ? "natural" : "vivid",
        });
        const url = response.data?.[0]?.url;
        if (!url) throw new Error("DALL-E 3 não retornou URL de imagem");
        return NextResponse.json({ url, provider: "dalle3", size, aspectRatio });
      }

      case "stability": {
        const apiKey = stabilityKey?.trim() || process.env.STABILITY_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "STABILITY_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const { positive, negative } = extractNegativePrompt(prompt);

        const resolvedStabilityModel = stabilityModel?.trim() || "stable-diffusion-xl-1024-v1-0";
        const { width, height } = pickStabilitySize(resolvedStabilityModel, aspectRatio);

        const isLogo = assetKey === "logo_primary" || assetKey === "logo_dark_bg";
        const isPattern = assetKey === "brand_pattern";
        const isMockup = ["business_card", "brand_collateral", "app_mockup", "outdoor_billboard"].includes(assetKey ?? "");

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
          aspectRatio,
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
              aspect_ratio: IDEOGRAM_RATIOS[aspectRatio],
              magic_prompt_option: isLogo ? "OFF" : "AUTO",
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
        return NextResponse.json({ url, provider: "ideogram", aspectRatio });
      }

      case "imagen": {
        const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          return NextResponse.json({ error: "GOOGLE_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho." }, { status: 500 });
        }
        const ai = new GoogleGenAI({ apiKey });
        const { positive, negative } = extractNegativePrompt(prompt);
        const model = googleImageModel?.trim() || "imagen-3.0-generate-002";

        if (model.startsWith("gemini")) {
          const ratioHints: Record<AspectRatioKey, string> = {
            "1:1": "square 1:1 aspect ratio",
            "16:9": "wide landscape 16:9 aspect ratio",
            "9:16": "tall portrait 9:16 aspect ratio",
            "4:3": "standard 4:3 landscape aspect ratio",
            "21:9": "ultra-wide cinematic 21:9 aspect ratio",
          };
          const fullPrompt = `${positive.slice(0, 1600)}\n\nGenerate as ${ratioHints[aspectRatio]} image.\n\nDo not include: ${negative.slice(0, 800)}.`;

          const hasRefImages = Array.isArray(referenceImages) && referenceImages.length > 0;
          const contentParts: unknown[] = [{ text: fullPrompt }];
          if (hasRefImages) {
            for (const imgDataUrl of referenceImages!) {
              const match = imgDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
              if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }

          const contents = hasRefImages
            ? (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"])
            : fullPrompt;

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
                aspectRatio,
              });
            }
          }
          throw new Error("Gemini não retornou imagem. Verifique se o modelo selecionado suporta geração de imagens.");
        }

        const imagenRatio = IMAGEN_RATIOS[aspectRatio];
        const resp = await ai.models.generateImages({
          model,
          prompt: `${positive.slice(0, 1600)}\n\nDo not include: ${negative.slice(0, 800)}.`.slice(0, 2000),
          config: {
            numberOfImages: 1,
            aspectRatio: imagenRatio,
            outputMimeType: "image/png",
          },
        });
        const imageBytes = resp.generatedImages?.[0]?.image?.imageBytes;
        if (!imageBytes) throw new Error("Imagen não retornou imagem");
        const b64 = bytesToBase64(imageBytes);
        return NextResponse.json({
          url: `data:image/png;base64,${b64}`,
          provider: "imagen",
          aspectRatio,
        });
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
