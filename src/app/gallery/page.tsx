import { prisma } from "@/lib/prisma"
import { parseBrandbookJson, safeHex } from "@/lib/brandbookJsonHelper"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Galeria — Brandbooks criados com IA",
  description: "Explore manuais de identidade visual criados com inteligência artificial. Inspiração para sua próxima marca.",
}

export const revalidate = 300

export default async function GalleryPage() {
  const shareLinks = await prisma.shareLink.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      project: {
        include: {
          brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { viewCount: "desc" },
    take: 24,
  })

  const brands = shareLinks
    .map((link) => {
      const bb = parseBrandbookJson(link.project.brandbookVersions[0]?.brandbookJson)
      if (!bb) return null
      const colors = [
        ...(bb.colors?.primary ?? []).slice(0, 3),
        ...(bb.colors?.secondary ?? []).slice(0, 2),
      ]
      return {
        token: link.token,
        name: bb.brandName || link.project.name,
        industry: bb.industry || link.project.industry,
        tagline: bb.verbalIdentity?.tagline ?? "",
        colors,
        views: link.viewCount,
      }
    })
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: "linear-gradient(135deg, #111827, #3730a3)" }}>B</div>
                Brandbook
              </Link>
            </div>
            <Link
              href="/login"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #111827, #3730a3)", boxShadow: "0 12px 24px -8px rgba(55,48,163,0.4)" }}
            >
              Criar o seu
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Galeria de Brandbooks
        </h1>
        <p className="mt-3 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          Explore manuais de identidade visual criados com inteligência artificial.
          Cada brandbook é um sistema completo de marca.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {brands.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 text-sm">Nenhum brandbook público disponível ainda.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700">
              Seja o primeiro a criar →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand!.token}
                href={`/s/${brand!.token}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Color hero */}
                <div className="h-32 relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {brand!.colors.map((c, i) => (
                      <div key={i} className="flex-1" style={{ background: safeHex(c.hex) }} />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-violet-700 transition-colors">
                    {brand!.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{brand!.industry}</p>
                  {brand!.tagline && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 italic">
                      &ldquo;{brand!.tagline}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex gap-1">
                      {brand!.colors.slice(0, 5).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ background: safeHex(c.hex) }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">
                      {brand!.views} {brand!.views === 1 ? "view" : "views"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Crie o seu brandbook com IA</h2>
        <p className="text-gray-400 text-sm mb-6">Identidade visual completa em minutos, não semanas.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 12px 24px -8px rgba(99,102,241,0.4)" }}
        >
          Começar grátis
        </Link>
      </div>
    </div>
  )
}
