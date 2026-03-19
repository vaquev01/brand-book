import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { parseBrandbookJson } from "@/lib/brandbookJsonHelper"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const projectId = request.nextUrl.searchParams.get("projectId")
    if (!projectId) {
      return NextResponse.json({ error: "projectId obrigatório" }, { status: 400 })
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    })
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    const versions = await prisma.brandbookVersion.findMany({
      where: { projectId },
      orderBy: { versionNumber: "desc" },
      select: {
        id: true,
        versionNumber: true,
        brandbookJson: true,
        lintScore: true,
        qualityScore: true,
        notes: true,
        createdAt: true,
      },
    })

    const parsed = versions.map((v) => {
      const bb = parseBrandbookJson(v.brandbookJson)
      return {
        id: v.id,
        versionNumber: v.versionNumber,
        lintScore: v.lintScore,
        qualityScore: v.qualityScore,
        notes: v.notes,
        createdAt: v.createdAt,
        brandName: bb?.brandName ?? "—",
        colorCount: (bb?.colors?.primary?.length ?? 0) + (bb?.colors?.secondary?.length ?? 0),
        sectionCount: bb ? Object.keys(bb).filter((k) => bb[k as keyof typeof bb] !== undefined).length : 0,
      }
    })

    return NextResponse.json({ versions: parsed })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao buscar versões"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
