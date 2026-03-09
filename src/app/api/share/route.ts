import { NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BodySchema = z.object({
  projectId: z.string(),
  password: z.string().optional(),
  expiresInDays: z.number().min(1).max(365).optional(),
})

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
