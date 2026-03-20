import { auth } from "@/app/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Project, BrandbookVersion } from "@/generated/prisma"
import { ProjectFilter } from "@/components/ProjectFilter"

type ProjectWithVersions = Project & {
  brandbookVersions: BrandbookVersion[]
}

export default async function ProjectsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-medium">Sessão expirada</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)" }}
        >
          Fazer login novamente
        </Link>
      </div>
    )
  }
  const userId = session.user.id

  const [projects, versionCounts] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      include: { brandbookVersions: { take: 1, orderBy: { createdAt: "desc" } } },
    }) as Promise<ProjectWithVersions[]>,
    prisma.brandbookVersion.groupBy({
      by: ["projectId"],
      _count: { id: true },
      where: { project: { ownerId: userId } },
    }),
  ])

  const versionMap = new Map(versionCounts.map((v) => [v.projectId, v._count.id]))

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Todos os seus projetos de marca ({projects.length})
          </p>
        </div>
        <Link
          href="/dashboard/new-brandbook"
          className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)",
            boxShadow: "0 20px 40px -24px rgba(55, 48, 163, 0.6)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Novo Brandbook
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum projeto ainda</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
            Crie seu primeiro brandbook ou use um template para começar.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/new-brandbook"
              className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)",
                boxShadow: "0 20px 40px -24px rgba(55, 48, 163, 0.6)",
              }}
            >
              Novo Brandbook
            </Link>
            <Link
              href="/dashboard/templates"
              className="inline-flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Ver Templates
            </Link>
          </div>
        </div>
      ) : (
        <ProjectFilter
          projects={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            industry: p.industry,
            status: p.status,
            updatedAt: p.updatedAt.toISOString(),
            brandbookVersions: p.brandbookVersions.map((v) => ({
              brandbookJson: v.brandbookJson as unknown,
            })),
            versionCount: versionMap.get(p.id) ?? 0,
          }))}
        />
      )}
    </div>
  )
}
