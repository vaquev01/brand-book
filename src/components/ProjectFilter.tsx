"use client"

import { useState, useMemo } from "react"

interface Project {
  id: string
  name: string
  industry: string
  status: string
}

interface Props {
  projects: Project[]
  renderCard: (project: Project, index: number) => React.ReactNode
}

export function ProjectFilter({ projects, renderCard }: Props) {
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
          {filtered.map((project, i) => renderCard(project, i))}
        </div>
      )}
    </div>
  )
}
