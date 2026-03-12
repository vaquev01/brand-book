import { NextRequest, NextResponse } from "next/server";
import { searchIcons, fetchIconSvg, fetchBrandIcons, mapBrandConceptsToSearchTerms } from "@/lib/services/iconBank";

export const runtime = "nodejs";

/**
 * GET /api/icons/search?q=coffee&limit=8&color=%23000000&size=24
 * Search for icons by keyword.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? "12"), 24);
  const color = searchParams.get("color") ?? undefined;
  const size = Number(searchParams.get("size") ?? "24") || 24;

  if (!query.trim()) {
    return NextResponse.json({ error: "Parâmetro 'q' é obrigatório." }, { status: 400 });
  }

  try {
    const results = await searchIcons(query, limit);
    // Fetch SVGs in parallel
    const icons = await Promise.all(
      results.map(async (r) => {
        const svg = await fetchIconSvg(r.prefix, r.name, { color, size });
        return { id: r.id, prefix: r.prefix, name: r.name, svg };
      })
    );
    return NextResponse.json({ icons: icons.filter((i) => i.svg) });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar ícones." }, { status: 500 });
  }
}

/**
 * POST /api/icons/search — Fetch a complete brand icon pack.
 * Body: { values?, personality?, industry?, keywords?, color?, size? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      values?: string[];
      personality?: string[];
      industry?: string;
      keywords?: string[];
      color?: string;
      size?: number;
    };

    const icons = await fetchBrandIcons({
      values: body.values,
      personality: body.personality,
      industry: body.industry,
      keywords: body.keywords,
      color: body.color,
      size: body.size ?? 24,
    });

    const searchTerms = mapBrandConceptsToSearchTerms({
      values: body.values,
      personality: body.personality,
      industry: body.industry,
      keywords: body.keywords,
    });

    return NextResponse.json({ icons, searchTerms });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar ícones da marca." }, { status: 500 });
  }
}
