import { NextRequest, NextResponse } from "next/server";

export interface ProviderModels {
  textModels: string[];
  imageModels: string[];
}

function sortByPriority(models: string[], patterns: RegExp[]): string[] {
  function rank(id: string): number {
    const idx = patterns.findIndex((re) => re.test(id));
    return idx === -1 ? patterns.length : idx;
  }
  return [...models].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

async function fetchOpenAIModels(apiKey: string): Promise<ProviderModels> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
  const data = await res.json() as { data: { id: string }[] };
  const ids = data.data.map((m) => m.id).sort();

  const TEXT_PREFIXES = ["gpt-4.5", "gpt-4.1", "gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5", "o1", "o3", "o4"];
  const IMAGE_IDS = ["dall-e-3", "dall-e-2"];

  const rawTextModels = ids.filter((id) =>
    TEXT_PREFIXES.some((p) => id.startsWith(p)) &&
    !id.includes("realtime") &&
    !id.includes("audio") &&
    !id.includes("instruct") &&
    !id.includes("embedding") &&
    !id.includes("whisper") &&
    !id.includes("tts") &&
    !id.includes("dall-e")
  );
  const OPENAI_TEXT_PRIORITY: RegExp[] = [
    /^gpt-4\.5/i,
    /^gpt-4\.1/i,
    /^gpt-4o/i,
    /^o4/i,
    /^o3/i,
    /^o1/i,
    /^gpt-4-turbo/i,
    /^gpt-4/i,
    /^gpt-3\.5/i,
  ];
  const textModels = sortByPriority(rawTextModels, OPENAI_TEXT_PRIORITY);
  const imageModels = ids.filter((id) => IMAGE_IDS.includes(id));
  return { textModels, imageModels };
}

async function fetchGoogleModels(apiKey: string): Promise<ProviderModels> {
  const textModels: string[] = [];
  const imageModels: string[] = [];

  let pageToken: string | undefined;
  do {
    const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("pageSize", "200");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Google: ${res.status}`);
    const data = await res.json() as {
      models?: { name: string; supportedGenerationMethods?: string[] }[];
      nextPageToken?: string;
    };

    for (const m of data.models ?? []) {
      const short = m.name.replace("models/", "");
      const methods = m.supportedGenerationMethods ?? [];
      const lower = short.toLowerCase();
      if (lower.includes("embedding") || lower.includes("aqa")) continue;

      const supportsContent = methods.includes("generateContent");
      const supportsImages = methods.includes("generateImages");

      if (lower.includes("imagen") || supportsImages || lower.includes("image")) {
        if (lower.includes("gemini") && !supportsContent && !supportsImages) continue;
        imageModels.push(short);
        continue;
      }

      if (lower.includes("gemini") && supportsContent) {
        textModels.push(short);
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  const GOOGLE_TEXT_PRIORITY: RegExp[] = [
    /^gemini-2\.5-pro/i,
    /^gemini-2\.5-flash/i,
    /^gemini-2\.0-pro/i,
    /^gemini-1\.5-pro/i,
    /^gemini-1\.5-flash/i,
  ];

  const uniqueText = Array.from(new Set(textModels));
  const uniqueImage = Array.from(new Set(imageModels));

  return {
    textModels: sortByPriority(uniqueText, GOOGLE_TEXT_PRIORITY),
    imageModels: uniqueImage.sort(),
  };
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
