import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BodySchema = z.object({
  projectId: z.string(),
  password: z.string().optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const projectId = request.nextUrl.searchParams.get("projectId")
    if (!projectId) return NextResponse.json({ error: "projectId obrigatório" }, { status: 400 })

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    })
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })

    const links = await prisma.shareLink.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        isActive: true,
        viewCount: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const data = links.map((l) => ({
      ...l,
      url: `${baseUrl}/s/${l.token}`,
      isExpired: l.expiresAt ? l.expiresAt < new Date() : false,
    }))

    return NextResponse.json({ links: data })
  } catch (err) {
    console.error("[share] GET Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { linkId } = (await request.json()) as { linkId?: string }
    if (!linkId) return NextResponse.json({ error: "linkId obrigatório" }, { status: 400 })

    const link = await prisma.shareLink.findUnique({
      where: { id: linkId },
      include: { project: { select: { ownerId: true } } },
    })

    if (!link || link.project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    }

    await prisma.shareLink.update({
      where: { id: linkId },
      data: { isActive: false },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[share] DELETE Error:", err)
    return NextResponse.json(
      { error: err instanceof SyntaxError ? "Invalid JSON body" : "Internal server error" },
      { status: err instanceof SyntaxError ? 400 : 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { projectId, password, expiresInDays } = parsed.data

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    })
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined

    const shareLink = await prisma.shareLink.create({
      data: {
        projectId,
        password: password ?? null,
        expiresAt: expiresAt ?? null,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3005"
    return NextResponse.json({
      data: {
        token: shareLink.token,
        url: `${baseUrl}/s/${shareLink.token}`,
        expiresAt: shareLink.expiresAt,
      },
    })
  } catch (err) {
    console.error("[share] Error:", err)
    return NextResponse.json(
      { error: err instanceof SyntaxError ? "Invalid JSON body" : "Internal server error" },
      { status: err instanceof SyntaxError ? 400 : 500 }
    )
  }
}
