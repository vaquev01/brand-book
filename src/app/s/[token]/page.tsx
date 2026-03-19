import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ShareBrandbookClient } from "./ShareBrandbookClient"

export default async function SharePage({ params }: { params: Promise<{ token: string }> | { token: string } }) {
  const { token } = await Promise.resolve(params);
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
          assets: true,
        },
      },
    },
  })

  if (!shareLink || !shareLink.isActive) notFound()

  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-800">Link expirado</h1>
          <p className="text-gray-500 mt-2">Este link de compartilhamento não é mais válido.</p>
        </div>
      </div>
    )
  }

  // Increment view count
  await prisma.shareLink.update({
    where: { token },
    data: { viewCount: { increment: 1 } },
  })

  const latestVersion = shareLink.project.brandbookVersions[0]
  const brandbook = latestVersion?.brandbookJson as any
  const generatedImages: Record<string, string> = {}

  // Collect asset URLs for viewer — prefer real publicUrl, fall back to sourceUrl (data: URL)
  // Skip placeholder URLs that won't resolve to actual images
  for (const asset of shareLink.project.assets ?? []) {
    const hasRealPublicUrl = asset.publicUrl && !asset.publicUrl.includes("_placeholder");
    const url = hasRealPublicUrl ? asset.publicUrl : (asset.sourceUrl ?? asset.publicUrl);
    if (asset.key && url) {
      generatedImages[asset.key] = url
    }
  }

  if (!brandbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center py-16">
          <p className="text-gray-500">Brandbook não encontrado</p>
        </div>
      </div>
    )
  }

  return <ShareBrandbookClient brandbook={brandbook} generatedImages={generatedImages} projectName={shareLink.project.name} shareToken={token} />
}
