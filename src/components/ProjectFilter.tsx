"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { DuplicateProjectButton } from "./DuplicateProjectButton"
import { parseBrandbookJson, safeHex } from "@/lib/brandbookJsonHelper"

interface ProjectData {
  id: string
  slug: string
  name: string
  industry: string
  status: string
  updatedAt: string
  brandbookVersions: Array<{ brandbookJson?: unknown }>
}

interface Props {
  projects: ProjectData[]
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-500", label: "Rascunho" },
  in_review: { bg: "bg-amber-50", text: "text-amber-600", label: "Em revisão" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Aprovado" },
  archived: { bg: "bg-gray-50", text: "text-gray-400", label: "Arquivado" },
}

export function ProjectFilter({ projects }: Props) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.industry.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [projects, query, statusFilter])

  const statuses = [
    { value: "all", label: "Todos" },
    { value: "draft", label: "Rascunho" },
    { value: "in_review", label: "Revisão" },
    { value: "approved", label: "Aprovado" },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Projetos ({filtered.length})
        </h2>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="flex gap-1">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  statusFilter === s.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-36 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">
            {query ? `Nenhum projeto encontrado para "${query}"` : "Nenhum projeto com este status"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <FilterProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterProjectCard({ project, index }: { project: ProjectData; index: number }) {
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
        <div className="flex items-center gap-1.5">
          <DuplicateProjectButton projectId={project.id} projectName={project.name} />
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors text-[15px]">
        {project.name}
      </h3>
      <p className="text-xs text-gray-400 mt-1 truncate">{project.industry}</p>
      {/* Mini palette preview */}
      {(() => {
        const bbJson = parseBrandbookJson(project.brandbookVersions[0]?.brandbookJson)
        const colors = [
          ...(bbJson?.colors?.primary ?? []).slice(0, 3),
          ...(bbJson?.colors?.secondary ?? []).slice(0, 2),
        ]
        if (colors.length === 0) return null
        return (
          <div className="flex gap-1 mt-3">
            {colors.map((c, i) => (
              <div
                key={i}
                className="h-2.5 flex-1 rounded-full first:rounded-l-full last:rounded-r-full"
                style={{ background: safeHex(c.hex) }}
              />
            ))}
          </div>
        )
      })()}
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
