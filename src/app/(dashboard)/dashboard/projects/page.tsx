import { auth } from "@/app/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Project, BrandbookVersion } from "@/generated/prisma"

type ProjectWithVersions = Project & {
  brandbookVersions: BrandbookVersion[]
}

export default async function ProjectsPage() {
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
    include: { brandbookVersions: { take: 1, orderBy: { createdAt: "desc" } } },
  })

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
            Crie seu primeiro brandbook ou use um template para comecar.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-500", label: "Rascunho" },
  in_review: { bg: "bg-amber-50", text: "text-amber-600", label: "Em revisao" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Aprovado" },
  archived: { bg: "bg-gray-50", text: "text-gray-400", label: "Arquivado" },
}

function ProjectCard({ project, index }: { project: ProjectWithVersions; index: number }) {
  const status = statusConfig[project.status] ?? statusConfig.draft
  const initial = project.name[0]?.toUpperCase() ?? "B"
  const hue = project.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <Link
      href={`/dashboard/editor?slug=${project.slug}`}
      className={`group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-violet-200/60 transition-all hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 65%, 52%) 0%, hsl(${(hue + 30) % 360}, 55%, 42%) 100%)`,
          }}
        >
          {initial}
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
      <h3 className="font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors text-[15px]">
        {project.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1 truncate">{project.industry}</p>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <p className="text-[11px] text-gray-300 font-medium">
          {new Date(project.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        {project.brandbookVersions.length > 0 && (
          <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">
            v{project.brandbookVersions.length}
          </span>
        )}
      </div>
    </Link>
  )
}
