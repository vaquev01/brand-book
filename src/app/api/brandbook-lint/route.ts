import { NextRequest, NextResponse } from "next/server";
import { lintBrandbook } from "@/lib/brandbookLinter";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";

export async function POST(request: NextRequest) {
  try {
    const { brandbook } = await request.json() as {
      brandbook?: Record<string, unknown>;
    };

    if (!brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório." }, { status: 400 });
    }

    const validated = validateLooseBrandbook(brandbook, {
      action: "rodar lint determinístico",
      subject: "Brandbook",
    });

    return NextResponse.json(lintBrandbook(validated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
