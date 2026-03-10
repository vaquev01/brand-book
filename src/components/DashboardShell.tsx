"use client"

import { useState } from "react"
import { MobileDrawer } from "./MobileDrawer"

interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between bg-white/90 backdrop-blur-xl px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 -ml-1 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">B</span>
          </div>
          <span className="text-sm font-bold text-gray-800">brandbook</span>
        </div>
        <div className="flex items-center gap-2">
          {user.image ? (
            <img src={user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-gray-100" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  )
}
