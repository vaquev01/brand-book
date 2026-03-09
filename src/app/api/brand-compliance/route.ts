import { NextResponse } from "next/server"
import { runComplianceCheck } from "@/lib/brandCompliance"
import { z } from "zod"

const BodySchema = z.object({
  brandbookData: z.record(z.unknown()),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const report = runComplianceCheck(parsed.data.brandbookData as any)
    return NextResponse.json({ data: report })
  } catch (err) {
    console.error("[brand-compliance] Error:", err)
    return NextResponse.json(
      { error: err instanceof SyntaxError ? "Invalid JSON body" : "Internal server error" },
      { status: err instanceof SyntaxError ? 400 : 500 }
    )
  }
}
