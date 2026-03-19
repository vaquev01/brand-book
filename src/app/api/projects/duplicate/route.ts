import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { projectId } = (await request.json()) as { projectId?: string }
    if (!projectId) {
      return NextResponse.json({ error: "projectId é obrigatório" }, { status: 400 })
    }

    // Find original project with latest version
    const original = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
      include: {
        brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!original) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    // Generate unique slug
    const baseSlug = `${original.slug}-copy`
    let slug = baseSlug
    let suffix = 1
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    // Create duplicate
    const duplicate = await prisma.project.create({
      data: {
        slug,
        name: `${original.name} (cópia)`,
        industry: original.industry,
        projectMode: original.projectMode,
        status: "draft",
        briefing: original.briefing,
        ownerId: session.user.id,
        workspaceId: original.workspaceId,
      },
    })

    // Copy latest brandbook version if exists
    const latestVersion = original.brandbookVersions[0]
    if (latestVersion) {
      await prisma.brandbookVersion.create({
        data: {
          projectId: duplicate.id,
          versionNumber: 1,
          brandbookJson: latestVersion.brandbookJson as any,
          lintScore: latestVersion.lintScore,
          qualityScore: latestVersion.qualityScore,
          notes: `Duplicado de "${original.name}"`,
        },
      })
    }

    return NextResponse.json({
      project: {
        id: duplicate.id,
        slug: duplicate.slug,
        name: duplicate.name,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao duplicar projeto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
