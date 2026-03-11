import { NextResponse } from "next/server"
import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { encryptApiKeys, decryptApiKeys } from "@/lib/apiKeyCrypto"

/** GET — Load the user's saved API keys (decrypted). */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { apiKeysEncrypted: true },
  })

  if (!user?.apiKeysEncrypted) {
    return NextResponse.json({ keys: null })
  }

  try {
    const decrypted = decryptApiKeys(user.apiKeysEncrypted)
    return NextResponse.json({ keys: JSON.parse(decrypted) })
  } catch {
    return NextResponse.json({ keys: null })
  }
}

/** PUT — Save the user's API keys (encrypted). */
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { keys } = body as { keys: Record<string, string> | null }

    if (!keys) {
      // Clear keys
      await prisma.user.update({
        where: { id: session.user.id },
        data: { apiKeysEncrypted: null },
      })
      return NextResponse.json({ ok: true })
    }

    // Only store non-empty key values
    const filtered = Object.fromEntries(
      Object.entries(keys).filter(([, v]) => typeof v === "string" && v.length > 0)
    )

    const encrypted = encryptApiKeys(JSON.stringify(filtered))
    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKeysEncrypted: encrypted },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api-keys] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
