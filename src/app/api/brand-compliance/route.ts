import { NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { runComplianceCheck } from "@/lib/brandCompliance"
import { z } from "zod"

const BodySchema = z.object({
  brandbookData: z.record(z.unknown()),
})

export async function POST(request: Request) {
  // Compliance check is available without auth (for public sharing)
  const body = await request.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const report = runComplianceCheck(parsed.data.brandbookData as any)
  return NextResponse.json({ data: report })
}
