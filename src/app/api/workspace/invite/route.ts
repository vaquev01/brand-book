import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { workspaceId, email, role } = (await request.json()) as {
      workspaceId?: string
      email?: string
      role?: string
    }

    if (!workspaceId || !email) {
      return NextResponse.json({ error: "workspaceId e email são obrigatórios" }, { status: 400 })
    }

    // Verify caller is owner/admin of workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    })

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Sem permissão para convidar" }, { status: 403 })
    }

    // Find or create the invited user
    let invitedUser = await prisma.user.findUnique({ where: { email } })

    if (!invitedUser) {
      // Create a placeholder user (they'll complete signup via OAuth)
      invitedUser = await prisma.user.create({
        data: { email, name: email.split("@")[0], role: "editor" },
      })
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitedUser.id } },
    })

    if (existing) {
      return NextResponse.json({ error: "Este email já é membro do workspace" }, { status: 409 })
    }

    // Add to workspace
    const validRoles = ["editor", "viewer", "admin"] as const
    const memberRole = validRoles.includes(role as any) ? (role as typeof validRoles[number]) : "editor"

    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: invitedUser.id,
        role: memberRole,
      },
    })

    return NextResponse.json({
      ok: true,
      member: { email: invitedUser.email, role: memberRole },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao convidar"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
