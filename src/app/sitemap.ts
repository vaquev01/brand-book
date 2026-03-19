import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://brandbook.app"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ]

  // Include active, non-expired shared brandbooks
  try {
    const shareLinks = await prisma.shareLink.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { token: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    })

    const sharedPages: MetadataRoute.Sitemap = shareLinks.map((link) => ({
      url: `${baseUrl}/s/${link.token}`,
      lastModified: link.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))

    return [...staticPages, ...sharedPages]
  } catch {
    return staticPages
  }
}
