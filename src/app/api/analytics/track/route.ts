import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BodySchema = z.object({
  projectId: z.string(),
  section: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

    const userAgent = request.headers.get("user-agent")
    const referer = request.headers.get("referer")
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()

    await prisma.pageView.create({
      data: {
        projectId: parsed.data.projectId,
        section: parsed.data.section,
        visitorId: ip ?? undefined,
        referer: referer ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
