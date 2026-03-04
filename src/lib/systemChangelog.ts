export type SystemChangeArea =
  | "prompts"
  | "providers"
  | "api"
  | "schema"
  | "ui"
  | "infra";

export type SystemChangelogEntry = {
  id: string;
  date: string;
  title: string;
  summary: string;
  areas: SystemChangeArea[];
  files?: string[];
};

export const PROMPT_SYSTEM_VERSION = "2026.03.04-soul-layer-v1";

export const SYSTEM_CHANGELOG: SystemChangelogEntry[] = [
  {
    id: "2026-03-04-soul-layer-10-10",
    date: "2026-03-04",
    title: "Prompts 10/10 — Soul Layer + Consistência Total",
    summary:
      "Introduz ARCHETYPE/EMOTIONAL_CORE/VIEWER_JOURNEY, integra brandStory + structuredPatterns + flora/fauna/objects, melhora provider params (Stability/Ideogram) e fortalece compose/refine prompts.",
    areas: ["prompts", "providers", "api", "schema", "ui"],
    files: [
      "src/lib/imagePrompts.ts",
      "src/app/api/generate-image/route.ts",
      "src/app/api/refine-image-prompt/route.ts",
      "src/app/api/compose-image-prompt/route.ts",
      "src/lib/types.ts",
      "src/lib/brandbookSchema.ts",
      "src/lib/prompt.ts",
      "src/components/BrandbookEditor.tsx",
    ],
  },
  {
    id: "2026-03-04-system-changelog",
    date: "2026-03-04",
    title: "System Changelog + Deploy Meta",
    summary:
      "Adiciona um registro de alterações do sistema (changelog) e endpoints para verificar versão/commit em produção e confirmar se a mudança subiu no Railway.",
    areas: ["infra", "api"],
    files: [
      "src/lib/systemChangelog.ts",
      "src/app/api/system-changelog/route.ts",
      "src/app/api/system-health/route.ts",
    ],
  },
];

export type RuntimeBuildMeta = {
  promptSystemVersion: string;
  changelogCount: number;
  changelogLatestId: string;
  nodeEnv?: string;
  commitSha?: string;
  branch?: string;
  railway?: {
    environment?: string;
    service?: string;
    deploymentId?: string;
  };
  fingerprint: string;
};

function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

export function getRuntimeBuildMeta(): RuntimeBuildMeta {
  const commitSha = firstEnv(
    "RAILWAY_GIT_COMMIT_SHA",
    "VERCEL_GIT_COMMIT_SHA",
    "GIT_COMMIT_SHA",
    "COMMIT_SHA"
  );
  const branch = firstEnv(
    "RAILWAY_GIT_BRANCH",
    "VERCEL_GIT_COMMIT_REF",
    "GIT_BRANCH",
    "BRANCH"
  );

  const railwayEnv = firstEnv("RAILWAY_ENVIRONMENT", "RAILWAY_ENV", "RAILWAY_ENV_NAME");
  const railwayService = firstEnv("RAILWAY_SERVICE_NAME", "RAILWAY_SERVICE");
  const railwayDeploymentId = firstEnv("RAILWAY_DEPLOYMENT_ID");

  const changelogLatestId = SYSTEM_CHANGELOG[0]?.id ? SYSTEM_CHANGELOG[SYSTEM_CHANGELOG.length - 1]!.id : "";

  const fingerprint = [
    `prompt=${PROMPT_SYSTEM_VERSION}`,
    `changelog=${changelogLatestId}`,
    commitSha ? `commit=${commitSha}` : "commit=unknown",
    railwayEnv ? `env=${railwayEnv}` : "",
  ]
    .filter(Boolean)
    .join("|");

  return {
    promptSystemVersion: PROMPT_SYSTEM_VERSION,
    changelogCount: SYSTEM_CHANGELOG.length,
    changelogLatestId,
    nodeEnv: process.env.NODE_ENV,
    commitSha,
    branch,
    railway: {
      environment: railwayEnv,
      service: railwayService,
      deploymentId: railwayDeploymentId,
    },
    fingerprint,
  };
}
