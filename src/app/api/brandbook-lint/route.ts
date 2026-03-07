import { NextRequest, NextResponse } from "next/server";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { formatZodIssues } from "@/lib/brandbookSchema";
import { lintBrandbook } from "@/lib/brandbookLinter";

export async function POST(request: NextRequest) {
  try {
    const { brandbook } = await request.json() as {
      brandbook?: Record<string, unknown>;
    };

    if (!brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório." }, { status: 400 });
    }

    const migrated = migrateBrandbook(brandbook);
    const parsed = BrandbookSchemaLoose.safeParse(migrated);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "brandbook inválido para lint determinístico. Erros:\n" + formatZodIssues(parsed.error.issues),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(lintBrandbook(parsed.data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
