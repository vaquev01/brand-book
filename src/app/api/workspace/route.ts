import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// GET: return the current user's workspace (first one where they are owner/admin)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ workspace: null })
    }

    return NextResponse.json({ workspace: membership.workspace, role: membership.role })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/GET] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: create workspace
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    // Check user's plan allows workspaces (team+)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    })

    const allowedPlans = ["team", "agency", "enterprise"]
    if (!user || !allowedPlans.includes(user.subscriptionTier)) {
      return NextResponse.json(
        { error: "Workspaces requerem plano Team ou superior." },
        { status: 403 },
      )
    }

    // Check if user already owns a workspace
    const existingOwnership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, role: "owner" },
    })

    if (existingOwnership) {
      return NextResponse.json(
        { error: "Voce ja possui um workspace." },
        { status: 409 },
      )
    }

    const { name } = (await request.json()) as { name?: string }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nome do workspace deve ter pelo menos 2 caracteres." },
        { status: 400 },
      )
    }

    // Generate a slug from the name
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Ensure slug uniqueness
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const existing = await prisma.workspace.findUnique({ where: { slug } })
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        plan: user.subscriptionTier as "free" | "pro" | "team" | "agency" | "enterprise",
        members: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/POST] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH: update workspace settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const body = (await request.json()) as {
      workspaceId: string
      name?: string
      logoUrl?: string
      primaryColor?: string
      customDomain?: string
    }

    if (!body.workspaceId) {
      return NextResponse.json({ error: "workspaceId obrigatorio." }, { status: 400 })
    }

    // Check user is owner or admin
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: body.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Sem permissao para editar este workspace." },
        { status: 403 },
      )
    }

    const updateData: Record<string, string | undefined> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl.trim() || undefined
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor.trim() || undefined
    if (body.customDomain !== undefined) updateData.customDomain = body.customDomain.trim() || undefined

    const workspace = await prisma.workspace.update({
      where: { id: body.workspaceId },
      data: updateData,
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json({ workspace })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/PATCH] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
