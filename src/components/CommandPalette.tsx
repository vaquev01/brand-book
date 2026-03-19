"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

interface CommandItem {
  id: string
  label: string
  icon: string
  action: () => void
  shortcut?: string
  category: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const items: CommandItem[] = [
    { id: "new", label: "Novo Brandbook", icon: "\u2726", action: () => router.push("/dashboard/new-brandbook"), shortcut: "N", category: "Acoes" },
    { id: "dashboard", label: "Dashboard", icon: "\u25FB", action: () => router.push("/dashboard"), shortcut: "D", category: "Navegacao" },
    { id: "projects", label: "Projetos", icon: "\u2750", action: () => router.push("/dashboard/projects"), category: "Navegacao" },
    { id: "editor", label: "Editor", icon: "\u270E", action: () => router.push("/dashboard/editor"), category: "Navegacao" },
    { id: "templates", label: "Templates", icon: "\u25A6", action: () => router.push("/dashboard/templates"), category: "Navegacao" },
    { id: "billing", label: "Plano & Billing", icon: "\u25C8", action: () => router.push("/dashboard/billing"), category: "Navegacao" },
    { id: "workspace", label: "Workspace", icon: "\u25CE", action: () => router.push("/dashboard/workspace"), category: "Navegacao" },
    { id: "analytics", label: "Analytics", icon: "\u25C6", action: () => router.push("/dashboard/analytics"), category: "Navegacao" },
  ]

  const filtered = query.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : items

  // Keyboard shortcut to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery("")
        setSelected(0)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Arrow key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && filtered[selected]) {
        e.preventDefault()
        filtered[selected].action()
        setOpen(false)
      }
    },
    [filtered, selected]
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg"
          >
            <div className="mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar acoes, paginas..."
                  className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                />
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-400 border border-gray-200">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    Nenhum resultado para &ldquo;{query}&rdquo;
                  </div>
                )}
                {filtered.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => { item.action(); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === selected ? "bg-violet-50 text-violet-900" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-400 border border-gray-200">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <span className="text-[10px] text-gray-400 font-medium">Navegar com &#8593;&#8595; &middot; Enter para selecionar</span>
                <span className="text-[10px] text-gray-300">&#8984;K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
