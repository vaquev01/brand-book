import { auth } from "@/app/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Project, BrandbookVersion } from "@/generated/prisma"
import { ProjectFilter } from "@/components/ProjectFilter"

type ProjectWithVersions = Project & {
  brandbookVersions: BrandbookVersion[]
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <p className="text-gray-400 text-sm">Sessão expirada. Faça login novamente.</p>
      </div>
    )
  }
  const userId = session.user.id

  const projects: ProjectWithVersions[] = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { brandbookVersions: { take: 1, orderBy: { createdAt: "desc" } } },
  })

  const totalCount = await prisma.project.count({ where: { ownerId: userId } })
  const totalProjects = projects.length
  const withBrandbook = projects.filter((p) => p.brandbookVersions.length > 0).length
  const inReview = projects.filter((p) => p.status === "in_review").length
  const approved = projects.filter((p) => p.status === "approved").length

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Seus brandbooks e projetos de marca</p>
        </div>
        <Link
          href="/dashboard/new-brandbook"
          className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)",
            boxShadow: "0 20px 40px -24px rgba(55, 48, 163, 0.6)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Novo Brandbook
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projetos" value={totalProjects} delay={0} emptyHint="Crie seu primeiro" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>} />
        <StatCard label="Brandbooks" value={withBrandbook} delay={1} emptyHint="Gere com IA" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>} />
        <StatCard label="Em revisão" value={inReview} delay={2} emptyHint="—" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>} />
        <StatCard label="Aprovados" value={approved} delay={3} emptyHint="—" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>} />
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <ProjectFilter
            projects={projects.map(p => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              industry: p.industry,
              status: p.status,
              updatedAt: p.updatedAt.toISOString(),
              brandbookVersions: p.brandbookVersions.map(v => ({
                brandbookJson: v.brandbookJson as unknown,
              })),
            }))}
          />
          {totalCount > projects.length && (
            <div className="mt-6 text-center">
              <a href="/dashboard/projects" className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                Ver todos os {totalCount} projetos &rarr;
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, delay, icon, emptyHint }: { label: string; value: number; delay: number; icon: React.ReactNode; emptyHint?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-fade-in-up stagger-${delay + 1} group hover:shadow-md hover:border-gray-200/80 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      {value === 0 && emptyHint ? (
        <div>
          <div className="text-2xl font-bold text-gray-200">0</div>
          <div className="text-[10px] text-gray-300 mt-1 font-medium">{emptyHint}</div>
        </div>
      ) : (
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up stagger-5">
      <div className="animate-float mb-6 inline-flex">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Crie seu primeiro brandbook</h3>
      <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Envie um logo ou descreva sua marca — identidade visual completa em minutos.
      </p>
      {/* Mini preview of what they'll create */}
      <div className="flex items-center justify-center gap-3 mb-8 opacity-60">
        <div className="flex gap-1">
          {["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ede9fe"].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ background: c }} />
          ))}
        </div>
        <div className="text-[10px] text-gray-300 font-medium">Paleta + Logo + Tipografia + Aplicações</div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/dashboard/new-brandbook"
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)",
            boxShadow: "0 20px 40px -24px rgba(55, 48, 163, 0.6)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
          Gerar com IA
        </Link>
        <Link
          href="/dashboard/editor?tab=examples"
          className="inline-flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Ver exemplos
        </Link>
      </div>
    </div>
  )
}

// ProjectCard is now inside ProjectFilter.tsx (client component)
