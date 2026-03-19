"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { INDUSTRY_TEMPLATES, type IndustryTemplate } from "@/lib/templates"

const ALL_TAGS = Array.from(
  new Set(INDUSTRY_TEMPLATES.flatMap((t) => t.tags))
).sort()

// Group tags into readable categories for the filter bar
const FILTER_TAGS = [
  { label: "Todos", value: "" },
  { label: "Gastronomia", value: "gastronomia" },
  { label: "Tech", value: "tech" },
  { label: "Saude", value: "saude" },
  { label: "Moda", value: "moda" },
  { label: "Juridico", value: "juridico" },
  { label: "Financeiro", value: "financeiro" },
  { label: "Fitness", value: "fitness" },
  { label: "Marketing", value: "marketing" },
  { label: "Design", value: "design" },
  { label: "Bebidas", value: "bebidas" },
  { label: "Personal", value: "personal-branding" },
]

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState("")

  const filtered = useMemo(() => {
    let results = INDUSTRY_TEMPLATES
    if (activeTag) {
      results = results.filter((t) => t.tags.includes(activeTag))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.industry.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      )
    }
    return results
  }, [search, activeTag])

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Comece com um template da sua industria e personalize com IA
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, industria ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag.value}
            onClick={() => setActiveTag(tag.value === activeTag ? "" : tag.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTag === tag.value
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* "Start from scratch" card */}
        <Link
          href="/dashboard/new-brandbook"
          className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 transition-all hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5 flex flex-col items-center justify-center text-center min-h-[280px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition-all">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 text-[15px] mb-1">
            Comecar do zero
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Briefing livre sem template — total liberdade criativa
          </p>
        </Link>

        {/* Template cards */}
        {filtered.map((template, i) => (
          <TemplateCard key={template.id} template={template} index={i} />
        ))}
      </div>

      {filtered.length === 0 && search.trim() && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            Nenhum template encontrado para &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => {
              setSearch("")
              setActiveTag("")
            }}
            className="mt-3 text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
          >
            Limpar busca
          </button>
        </div>
      )}
    </div>
  )
}

function TemplateCard({
  template,
  index,
}: {
  template: IndustryTemplate
  index: number
}) {
  return (
    <Link
      href={`/dashboard/new-brandbook?template=${template.id}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      {/* Thumbnail gradient */}
      <div
        className="h-32 w-full relative overflow-hidden"
        style={{ background: template.thumbnail }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
            {template.icon}
          </span>
        </div>
        {/* Creativity badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm ${
              template.creativityLevel === "conservative"
                ? "bg-white/20 text-white"
                : template.creativityLevel === "balanced"
                ? "bg-white/25 text-white"
                : "bg-white/30 text-white"
            }`}
          >
            {template.creativityLevel === "conservative"
              ? "Classico"
              : template.creativityLevel === "balanced"
              ? "Equilibrado"
              : "Ousado"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-[15px] group-hover:text-violet-700 transition-colors">
              {template.name}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {template.industry}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Palette bar preview */}
        <div className="flex h-3 rounded-full overflow-hidden mb-3">
          {template.suggestedColors.primary.map((color, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
          {template.suggestedColors.secondary.slice(0, 2).map((color, i) => (
            <div key={`s-${i}`} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>

        {/* Font pairing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium">Fontes:</span>
            <span className="text-[11px] text-gray-600 font-semibold">{template.suggestedFonts.marketing}</span>
            <span className="text-[10px] text-gray-300">+</span>
            <span className="text-[11px] text-gray-500">{template.suggestedFonts.ui}</span>
          </div>
          <div className="flex -space-x-1">
            {template.suggestedColors.primary.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-50">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover CTA overlay */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
        <span className="text-xs font-semibold text-violet-600">
          Usar template →
        </span>
      </div>
    </Link>
  )
}
