import { auth } from "@/app/auth"
import { prisma } from "@/lib/prisma"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <p className="text-gray-400 text-sm">Sessão expirada. Faça login novamente.</p>
      </div>
    )
  }
  const userId = session.user.id

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true, slug: true, status: true, createdAt: true },
  })

  const projectIds = projects.map((p) => p.id)

  const [totalViews, totalVersions, totalShares, recentViews] = await Promise.all([
    projectIds.length > 0
      ? prisma.pageView.count({ where: { projectId: { in: projectIds } } })
      : 0,
    projectIds.length > 0
      ? prisma.brandbookVersion.count({ where: { projectId: { in: projectIds } } })
      : 0,
    projectIds.length > 0
      ? prisma.shareLink.count({ where: { projectId: { in: projectIds } } })
      : 0,
    projectIds.length > 0
      ? prisma.pageView.findMany({
          where: { projectId: { in: projectIds } },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            createdAt: true,
            referer: true,
            project: { select: { name: true, slug: true } },
          },
        })
      : [],
  ])

  // Views per project
  const viewsByProject = await (projectIds.length > 0
    ? prisma.pageView.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projectIds } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      })
    : Promise.resolve([]))

  const projectMap = new Map(projects.map((p) => [p.id, p]))

  return (
    <div className="animate-page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm">Visualizações e uso dos seus brandbooks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projetos" value={projects.length} icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
        } />
        <StatCard label="Visualizações" value={totalViews} icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
        } />
        <StatCard label="Versões" value={totalVersions} icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
        } />
        <StatCard label="Links compartilhados" value={totalShares} icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        } />
      </div>

      {totalViews === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-500">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ainda sem visualizações</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Compartilhe seu primeiro brandbook para começar a acompanhar visualizações, downloads e engajamento.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top projects by views */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Top projetos por views</h2>
          {viewsByProject.length === 0 ? (
            <p className="text-sm text-gray-300 py-8 text-center">Nenhuma visualização ainda</p>
          ) : (
            <div className="space-y-3">
              {viewsByProject.map((row) => {
                const project = projectMap.get(row.projectId)
                if (!project) return null
                const count = row._count.id
                const maxCount = viewsByProject[0]?._count.id || 1
                return (
                  <div key={row.projectId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.max((count / maxCount) * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent views */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Visualizações recentes</h2>
          {recentViews.length === 0 ? (
            <p className="text-sm text-gray-300 py-8 text-center">Nenhuma visualização ainda</p>
          ) : (
            <div className="space-y-2">
              {recentViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{view.project.name}</p>
                    {view.referer && (
                      <p className="text-[11px] text-gray-300 truncate">{view.referer}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-300 font-medium shrink-0 ml-3">
                    {new Date(view.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}
