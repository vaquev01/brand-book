"use client"

import { useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getTemplateById } from "@/lib/templates"

function NewBrandbookContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const template = useMemo(
    () => (templateId ? getTemplateById(templateId) : undefined),
    [templateId]
  )

  useEffect(() => {
    try {
      localStorage.removeItem("bb_active_slug")
      sessionStorage.setItem("bb_force_new", "1")

      // If a template is selected, store its data so the editor can pick it up
      if (template) {
        sessionStorage.setItem(
          "bb_template",
          JSON.stringify({
            id: template.id,
            name: template.name,
            industry: template.industry,
            creativityLevel: template.creativityLevel,
            suggestedScope: template.suggestedScope,
            guidedBriefing: template.guidedBriefing,
            suggestedColors: template.suggestedColors,
            suggestedFonts: template.suggestedFonts,
          })
        )
      } else {
        sessionStorage.removeItem("bb_template")
      }
    } catch {}
    window.location.replace("/dashboard/editor")
  }, [template])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      {template && (
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-xl">
          <span className="text-lg">{template.icon}</span>
          <span className="text-sm font-medium text-violet-700">
            Usando template: {template.name}
          </span>
        </div>
      )}
      <p className="text-sm text-gray-400 animate-pulse">
        {template
          ? `Preparando brandbook com template "${template.name}"...`
          : "Preparando novo brandbook..."}
      </p>
    </div>
  )
}

export default function NewBrandbookRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-400 animate-pulse">
            Preparando novo brandbook...
          </p>
        </div>
      }
    >
      <NewBrandbookContent />
    </Suspense>
  )
}
