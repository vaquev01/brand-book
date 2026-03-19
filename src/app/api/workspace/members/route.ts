import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// GET: list members of a workspace
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId obrigatorio." }, { status: 400 })
    }

    // Verify user is a member
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Sem acesso a este workspace." }, { status: 403 })
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ members })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/members/GET] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: invite a member
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const body = (await request.json()) as {
      workspaceId: string
      email: string
      role?: "admin" | "editor" | "viewer"
    }

    if (!body.workspaceId || !body.email) {
      return NextResponse.json(
        { error: "workspaceId e email sao obrigatorios." },
        { status: 400 },
      )
    }

    const email = body.email.trim().toLowerCase()
    const role = body.role || "editor"
    const validRoles = ["admin", "editor", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Role invalida." }, { status: 400 })
    }

    // Check inviter is owner or admin
    const inviterMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: body.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!inviterMembership || !["owner", "admin"].includes(inviterMembership.role)) {
      return NextResponse.json(
        { error: "Sem permissao para convidar membros." },
        { status: 403 },
      )
    }

    // Find the user to invite
    const invitee = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (!invitee) {
      return NextResponse.json(
        { error: `Usuario com email ${email} nao encontrado. Ele precisa ter uma conta primeiro.` },
        { status: 404 },
      )
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: body.workspaceId,
          userId: invitee.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Este usuario ja e membro do workspace." },
        { status: 409 },
      )
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: body.workspaceId,
        userId: invitee.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/members/POST] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: remove a member
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
    }

    const body = (await request.json()) as {
      workspaceId: string
      memberId: string
    }

    if (!body.workspaceId || !body.memberId) {
      return NextResponse.json(
        { error: "workspaceId e memberId sao obrigatorios." },
        { status: 400 },
      )
    }

    // Check requester is owner or admin
    const requesterMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: body.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!requesterMembership || !["owner", "admin"].includes(requesterMembership.role)) {
      return NextResponse.json(
        { error: "Sem permissao para remover membros." },
        { status: 403 },
      )
    }

    // Find the member to remove
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: body.memberId },
    })

    if (!memberToRemove || memberToRemove.workspaceId !== body.workspaceId) {
      return NextResponse.json({ error: "Membro nao encontrado." }, { status: 404 })
    }

    // Cannot remove the owner
    if (memberToRemove.role === "owner") {
      return NextResponse.json(
        { error: "Nao e possivel remover o proprietario do workspace." },
        { status: 400 },
      )
    }

    await prisma.workspaceMember.delete({
      where: { id: body.memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[workspace/members/DELETE] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
