import type { ApiKeys } from "@/components/ApiKeyConfig";
import { readJsonResponse } from "@/lib/http";
import type { AspectRatioOption, AssetKey } from "@/lib/imagePrompts";
import type { AiTextProvider, BrandbookData, ImageProvider } from "@/lib/types";

function buildTextProviderPayload(promptProvider: AiTextProvider, apiKeys: ApiKeys) {
  return {
    textProvider: promptProvider,
    openaiKey: apiKeys.openai || undefined,
    googleKey: apiKeys.google || undefined,
    openaiModel: promptProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
    googleModel: promptProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
  };
}

export function hasPromptOpsProviderKey(promptProvider: AiTextProvider, apiKeys: ApiKeys): boolean {
  return promptProvider === "openai" ? !!apiKeys.openai : !!apiKeys.google;
}

export async function refineImagePromptClient(input: {
  basePrompt: string;
  imageProvider: ImageProvider;
  assetKey?: AssetKey | string;
  promptProvider: AiTextProvider;
  apiKeys: ApiKeys;
}): Promise<string | null> {
  const refineRes = await fetch("/api/refine-image-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      basePrompt: input.basePrompt,
      imageProvider: input.imageProvider,
      assetKey: input.assetKey,
      ...buildTextProviderPayload(input.promptProvider, input.apiKeys),
    }),
  });
  const refineJson = await readJsonResponse<{
    prompt?: string;
    error?: string;
  }>(refineRes, "/api/refine-image-prompt");

  if (!refineRes.ok || !refineJson.prompt) return null;
  return refineJson.prompt;
}

export async function composeImagePromptClient(input: {
  brandbook: BrandbookData;
  brief: string;
  imageProvider: ImageProvider;
  aspectRatio: AspectRatioOption;
  creativity: "consistent" | "balanced" | "creative";
  referenceImageDataUrl?: string;
  referenceImageMode?: "strict" | "guided" | "loose" | "remix";
  promptProvider: AiTextProvider;
  apiKeys: ApiKeys;
}): Promise<string> {
  const composeRes = await fetch("/api/compose-image-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brandbook: input.brandbook,
      brief: input.brief,
      imageProvider: input.imageProvider,
      aspectRatio: input.aspectRatio,
      creativity: input.creativity,
      referenceImageDataUrl: input.referenceImageDataUrl || undefined,
      referenceImageMode: input.referenceImageDataUrl ? input.referenceImageMode : undefined,
      ...buildTextProviderPayload(input.promptProvider, input.apiKeys),
    }),
  });
  const composeJson = await readJsonResponse<{
    prompt?: string;
    error?: string;
  }>(composeRes, "/api/compose-image-prompt");

  if (!composeRes.ok || !composeJson.prompt) {
    throw new Error(composeJson.error ?? "Erro ao compor prompt");
  }

  return composeJson.prompt;
}
