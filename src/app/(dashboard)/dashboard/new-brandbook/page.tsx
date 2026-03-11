"use client"

import { useEffect } from "react"

/**
 * Nuclear redirect page: clears ALL stale state then hard-navigates to a
 * fresh editor. Because this is a *different* route the editor component
 * is guaranteed to mount from scratch.
 */
export default function NewBrandbookRedirect() {
  useEffect(() => {
    try {
      localStorage.removeItem("bb_active_slug")
      sessionStorage.setItem("bb_force_new", "1")
    } catch {}
    window.location.replace("/dashboard/editor")
  }, [])

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-400 animate-pulse">Preparando novo brandbook...</p>
    </div>
  )
}
