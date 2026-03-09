import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

async function getWorkspaceFromToken(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const token = auth.slice(7)
  const crypto = await import("crypto")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  const apiToken = await prisma.apiToken.findUnique({
    where: { tokenHash },
    include: { workspace: true },
  })

  if (!apiToken) return null
  if (apiToken.expiresAt && apiToken.expiresAt < new Date()) return null

  // Update last used
  await prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  })

  return apiToken.workspace
}

export async function GET(request: NextRequest) {
  const workspace = await getWorkspaceFromToken(request)
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.project.count({ where: { workspaceId: workspace.id } }),
  ])

  return NextResponse.json({
    data: projects,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
