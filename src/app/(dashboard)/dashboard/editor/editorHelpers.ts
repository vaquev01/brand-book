import type { AiTextProvider } from "@/lib/types";
import type { ApiKeys } from "@/components/ApiKeyConfig";
import { hasPromptOpsProviderKey } from "@/lib/imagePromptClient";

export function isAiTextProvider(value: string | null | undefined): value is AiTextProvider {
  return value === "openai" || value === "gemini";
}

export function pickDefaultTextProvider(keys: ApiKeys): AiTextProvider {
  if (keys.openai) return "openai";
  if (keys.google) return "gemini";
  return "openai";
}

export function resolveTextProviderPreference(rawValue: string | null | undefined, keys: ApiKeys): AiTextProvider {
  const fallback = pickDefaultTextProvider(keys);
  if (!isAiTextProvider(rawValue)) return fallback;
  if (hasPromptOpsProviderKey(rawValue, keys) || (!keys.openai && !keys.google)) return rawValue;
  return fallback;
}

export function getTextProviderModel(provider: AiTextProvider, keys: ApiKeys): string {
  return provider === "openai"
    ? keys.openaiTextModel || "GPT-4o"
    : keys.googleTextModel || "Gemini 1.5";
}
