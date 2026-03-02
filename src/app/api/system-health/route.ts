import { NextResponse } from "next/server";
import { ASSET_CATALOG } from "@/lib/imagePrompts";
import { AssetKeySchema } from "@/lib/brandbookSchema";

type Severity = "critical" | "warning" | "suggestion";

export type Issue = {
  severity: Severity;
  area: string;
  issue: string;
  fix: string;
};

export type SystemHealthReport = {
  ok: boolean;
  summary: string;
  stats: {
    assets: number;
    categories: Record<string, number>;
    aspectRatios: Record<string, number>;
  };
  issues: Issue[];
};

function buildReport(): SystemHealthReport {
  const issues: Issue[] = [];

  const keys = ASSET_CATALOG.map((a) => a.key);
  const unique = new Set(keys);
  if (unique.size !== keys.length) {
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    issues.push({
      severity: "critical",
      area: "ASSET_CATALOG",
      issue: `Asset keys duplicados: ${[...new Set(dupes)].join(", ")}`,
      fix: "Garanta que cada item em ASSET_CATALOG tenha uma key única.",
    });
  }

  const allowedRatios = new Set(["1:1", "16:9", "9:16", "4:3", "21:9"]);
  const invalidRatios = ASSET_CATALOG.filter((a) => !allowedRatios.has(a.aspectRatio)).map((a) => `${a.key}=${a.aspectRatio}`);
  if (invalidRatios.length > 0) {
    issues.push({
      severity: "critical",
      area: "ASSET_CATALOG",
      issue: `Aspect ratios inválidos: ${invalidRatios.join(" | ")}`,
      fix: `Use somente: ${Array.from(allowedRatios).join(", ")}.`,
    });
  }

  const schemaKeys = (AssetKeySchema.options ?? []) as unknown as string[];
  const keySet = new Set<string>(keys as unknown as string[]);
  const schemaKeySet = new Set<string>(schemaKeys);
  const missingInSchema = (keys as unknown as string[]).filter((k) => !schemaKeySet.has(k));
  const extraInSchema = schemaKeys.filter((k) => !keySet.has(k));
  if (missingInSchema.length > 0 || extraInSchema.length > 0) {
    issues.push({
      severity: "critical",
      area: "brandbookSchema.AssetKeySchema",
      issue: `Desync AssetKeySchema ↔ ASSET_CATALOG. missingInSchema=[${missingInSchema.join(", ")}], extraInSchema=[${extraInSchema.join(", ")}].`,
      fix: "Mantenha AssetKeySchema derivado de ASSET_CATALOG (single source of truth).",
    });
  }

  const categories: Record<string, number> = {};
  const aspectRatios: Record<string, number> = {};
  for (const a of ASSET_CATALOG) {
    categories[a.category] = (categories[a.category] ?? 0) + 1;
    aspectRatios[a.aspectRatio] = (aspectRatios[a.aspectRatio] ?? 0) + 1;
  }

  if ((categories.logo ?? 0) === 0) {
    issues.push({
      severity: "warning",
      area: "ASSET_CATALOG",
      issue: "Nenhum asset na categoria 'logo'.",
      fix: "Adicione pelo menos um asset de logo (ex: logo_primary).",
    });
  }

  const ok = issues.every((i) => i.severity !== "critical");

  return {
    ok,
    summary: ok
      ? "Sistema consistente: catálogo, schema e aspect ratios estão sincronizados."
      : "Sistema com inconsistências: revise os itens críticos para evitar regressões.",
    stats: { assets: ASSET_CATALOG.length, categories, aspectRatios },
    issues,
  };
}

export async function GET() {
  try {
    return NextResponse.json(buildReport());
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
