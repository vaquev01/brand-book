"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function DuplicateProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/projects/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-50"
      title={`Duplicar "${projectName}"`}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      )}
    </button>
  )
}
