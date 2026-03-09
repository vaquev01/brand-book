import { NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { storagePresignUpload, buildAssetKey } from "@/lib/storage"
import { z } from "zod"

const BodySchema = z.object({
  projectId: z.string(),
  assetKey: z.string(),
  contentType: z.string().default("image/png"),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const { projectId, assetKey, contentType } = parsed.data
  const ext = contentType.split("/")[1] ?? "png"
  const key = buildAssetKey(projectId, assetKey, ext)

  try {
    const { uploadUrl, publicUrl } = await storagePresignUpload(key, { contentType })
    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
  }
}
