import { NextResponse } from "next/server";
import { SYSTEM_CHANGELOG, getRuntimeBuildMeta } from "@/lib/systemChangelog";

export const runtime = "nodejs";

export type SystemChangelogResponse = {
  meta: ReturnType<typeof getRuntimeBuildMeta>;
  changelog: typeof SYSTEM_CHANGELOG;
};

export async function GET() {
  try {
    const meta = getRuntimeBuildMeta();
    const body: SystemChangelogResponse = {
      meta,
      changelog: SYSTEM_CHANGELOG,
    };
    return NextResponse.json(body);
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
