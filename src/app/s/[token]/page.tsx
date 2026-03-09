import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function SharePage({ params }: { params: { token: string } }) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token: params.token },
    include: {
      project: {
        include: {
          brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
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
    where: { token: params.token },
    data: { viewCount: { increment: 1 } },
  })

  const latestVersion = shareLink.project.brandbookVersions[0]
  const brandbook = latestVersion?.brandbookJson as any

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-violet-600">✦</span>
          <span className="font-semibold text-gray-800">{shareLink.project.name}</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Brandbook</span>
        </div>
        <div className="text-xs text-gray-400">
          Gerado com ✦ brandbook
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4">
        {brandbook ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {brandbook.brandName ?? shareLink.project.name}
            </h1>
            {brandbook.brandConcept?.mission && (
              <p className="text-gray-500 text-lg mb-8">{brandbook.brandConcept.mission}</p>
            )}
            {brandbook.colors?.primary && (
              <section className="mb-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
                  Paleta de Cores
                </h2>
                <div className="flex gap-3">
                  {[
                    ...(brandbook.colors.primary ?? []),
                    ...(brandbook.colors.secondary ?? []),
                  ].map((c: any, i: number) => (
                    <div key={i} className="flex-1 min-w-0">
                      <div className="h-16 rounded-xl mb-2" style={{ background: c.hex }} />
                      <p className="text-xs font-mono text-gray-500 truncate">{c.hex}</p>
                      <p className="text-xs text-gray-400 truncate">{c.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Gerado com ✦ brandbook AI</p>
              <a href="/" className="text-xs font-semibold text-violet-600 hover:underline">
                Criar seu brandbook →
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Brandbook não encontrado</p>
          </div>
        )}
      </main>
    </div>
  )
}
