import { NextRequest, NextResponse } from "next/server";

export interface ProviderModels {
  textModels: string[];
  imageModels: string[];
}

async function fetchOpenAIModels(apiKey: string): Promise<ProviderModels> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
  const data = await res.json() as { data: { id: string }[] };
  const ids = data.data.map((m) => m.id).sort();

  const TEXT_PREFIXES = ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5", "o1", "o3", "o4"];
  const IMAGE_IDS = ["dall-e-3", "dall-e-2"];

  const textModels = ids.filter((id) =>
    TEXT_PREFIXES.some((p) => id.startsWith(p)) &&
    !id.includes("realtime") &&
    !id.includes("audio") &&
    !id.includes("instruct") &&
    !id.includes("embedding") &&
    !id.includes("whisper") &&
    !id.includes("tts") &&
    !id.includes("dall-e")
  );
  const imageModels = ids.filter((id) => IMAGE_IDS.includes(id));
  return { textModels, imageModels };
}

async function fetchGoogleModels(apiKey: string): Promise<ProviderModels> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`
  );
  if (!res.ok) throw new Error(`Google: ${res.status}`);
  const data = await res.json() as { models: { name: string; supportedGenerationMethods?: string[] }[] };

  const textModels: string[] = [];
  const imageModels: string[] = [];

  for (const m of data.models ?? []) {
    const short = m.name.replace("models/", "");
    const methods = m.supportedGenerationMethods ?? [];
    if (short.includes("embedding") || short.includes("aqa")) continue;
    if (short.includes("imagen")) {
      imageModels.push(short);
    } else if (short.includes("gemini") && methods.includes("generateContent")) {
      if (short.includes("image")) {
        imageModels.push(short);
      } else {
        textModels.push(short);
      }
    }
  }
  const ALWAYS_GOOGLE_IMAGE_MODELS = [
    "gemini-3.1-flash-image-preview",
    "gemini-3-pro-image-preview",
    "gemini-2.5-flash-image",
    "imagen-3.0-generate-002",
    "imagen-3.0-fast-generate-001",
  ];
  for (const m of ALWAYS_GOOGLE_IMAGE_MODELS) {
    if (!imageModels.includes(m)) imageModels.push(m);
  }

  return { textModels: textModels.sort(), imageModels: imageModels.sort() };
}

async function fetchStabilityModels(apiKey: string): Promise<ProviderModels> {
  const res = await fetch("https://api.stability.ai/v1/engines/list", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Stability AI: ${res.status}`);
  const data = await res.json() as { id: string; type: string; ready: boolean }[];
  const imageModels = data
    .filter((e) => e.ready && (e.type === "PICTURE" || e.id.includes("stable-diffusion")))
    .map((e) => e.id)
    .sort();
  return { textModels: [], imageModels: imageModels.length ? imageModels : ["stable-diffusion-xl-1024-v1-0"] };
}

function fetchIdeogramModels(): ProviderModels {
  return {
    textModels: [],
    imageModels: ["V_3", "V_2_TURBO", "V_2", "V_1_TURBO", "V_1"],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json() as { provider: string; apiKey: string };
    if (!provider || !apiKey?.trim()) {
      return NextResponse.json({ error: "provider e apiKey são obrigatórios" }, { status: 400 });
    }

    let models: ProviderModels;
    switch (provider) {
      case "openai":
        models = await fetchOpenAIModels(apiKey.trim());
        break;
      case "google":
        models = await fetchGoogleModels(apiKey.trim());
        break;
      case "stability":
        models = await fetchStabilityModels(apiKey.trim());
        break;
      case "ideogram":
        models = fetchIdeogramModels();
        break;
      default:
        return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
    }

    return NextResponse.json(models);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
