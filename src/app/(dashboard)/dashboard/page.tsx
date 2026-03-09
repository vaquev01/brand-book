import { auth } from "@/app/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import type { Project, BrandbookVersion } from "@/generated/prisma"

type ProjectWithVersions = Project & {
  brandbookVersions: BrandbookVersion[]
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id

  const projects: ProjectWithVersions[] = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    take: 12,
    include: { brandbookVersions: { take: 1, orderBy: { createdAt: "desc" } } },
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Seus brandbooks e projetos de marca</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          ✦ Novo Brandbook
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Projetos", value: projects.length, icon: "📁" },
          { label: "Brandbooks gerados", value: projects.filter((p) => p.brandbookVersions.length > 0).length, icon: "✦" },
          { label: "Em revisão", value: projects.filter((p) => p.status === "in_review").length, icon: "👁" },
          { label: "Aprovados", value: projects.filter((p) => p.status === "approved").length, icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-4">✦</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum projeto ainda</h3>
          <p className="text-gray-400 mb-6">Crie seu primeiro brandbook com IA em minutos</p>
          <Link
            href="/dashboard/projects/new"
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
          >
            Criar primeiro brandbook
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Projetos recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  in_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-400",
}

function ProjectCard({ project }: { project: ProjectWithVersions }) {
  return (
    <Link
      href={`/?slug=${project.slug}`}
      className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
          {project.name[0].toUpperCase()}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] ?? ""}`}
        >
          {project.status}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 truncate group-hover:text-violet-700 transition-colors">
        {project.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1">{project.industry}</p>
      <p className="text-xs text-gray-300 mt-3">
        {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
      </p>
    </Link>
  )
}
