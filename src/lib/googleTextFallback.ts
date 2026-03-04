import { resolveGoogleTextModel } from "@/lib/googleModels";

type GoogleListedModel = {
  name: string;
  supportedGenerationMethods?: string[];
};

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

async function listGoogleModels(apiKey: string): Promise<GoogleListedModel[]> {
  const out: GoogleListedModel[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("pageSize", "200");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Google: ${res.status}`);
    const data = await res.json() as { models?: GoogleListedModel[]; nextPageToken?: string };
    out.push(...(data.models ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return out;
}

function pickBestGoogleTextModelShort(models: GoogleListedModel[]): string | null {
  const textModels: string[] = [];

  for (const m of models) {
    const short = m.name.replace("models/", "");
    const lower = short.toLowerCase();
    if (lower.includes("embedding") || lower.includes("aqa")) continue;
    if (!lower.includes("gemini")) continue;
    if (lower.includes("image")) continue;

    const methods = m.supportedGenerationMethods ?? [];
    if (methods.includes("generateContent")) textModels.push(short);
  }

  const unique = Array.from(new Set(textModels));

  const PRIORITY: RegExp[] = [
    /^gemini-3\.1/i,
    /^gemini-3/i,
    /^gemini-2\.5-pro/i,
    /^gemini-2\.5-flash/i,
    /^gemini-2\.0/i,
    /^gemini-1\.5/i,
  ];

  const sorted = sortByPriority(unique, PRIORITY);
  return sorted[0] ?? null;
}

function listAllGoogleTextModelShort(models: GoogleListedModel[]): string[] {
  const textModels: string[] = [];

  for (const m of models) {
    const short = m.name.replace("models/", "");
    const lower = short.toLowerCase();
    if (lower.includes("embedding") || lower.includes("aqa")) continue;
    if (!lower.includes("gemini")) continue;
    if (lower.includes("image")) continue;

    const methods = m.supportedGenerationMethods ?? [];
    if (methods.includes("generateContent")) textModels.push(short);
  }

  const unique = Array.from(new Set(textModels));
  const PRIORITY: RegExp[] = [
    /^gemini-3\.1/i,
    /^gemini-3/i,
    /^gemini-2\.5-pro/i,
    /^gemini-2\.5-flash/i,
    /^gemini-2\.0/i,
    /^gemini-1\.5/i,
  ];
  return sortByPriority(unique, PRIORITY);
}

export function isGoogleModelMissingError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /\b404\b|not found|is not found|no longer available|not supported for generatecontent/i.test(msg);
}

export async function withGoogleTextModelFallback<T>({
  apiKey,
  preferredModel,
  run,
}: {
  apiKey: string;
  preferredModel?: string;
  run: (model: string) => Promise<T>;
}): Promise<{ value: T; model: string; fellBack: boolean }> {
  const preferred = preferredModel?.trim() ? resolveGoogleTextModel(preferredModel) : null;

  if (preferred) {
    try {
      const value = await run(preferred);
      return { value, model: preferred, fellBack: false };
    } catch (err: unknown) {
      if (!isGoogleModelMissingError(err)) throw err;
    }
  }

  const list = await listGoogleModels(apiKey);
  const candidateModels = listAllGoogleTextModelShort(list)
    .filter((m) => m && m !== preferred)
    .slice(0, 12);

  if (candidateModels.length === 0) {
    throw new Error("Nenhum modelo Gemini compatível disponível para esta chave.");
  }

  let lastErr: unknown = null;
  for (const model of candidateModels) {
    try {
      const value = await run(model);
      return { value, model, fellBack: true };
    } catch (err: unknown) {
      lastErr = err;
      if (isGoogleModelMissingError(err)) continue;
      throw err;
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error("Falha ao executar Gemini: nenhum modelo disponível funcionou.");
}
